/**
 * AI ASSISTANT FUNCTION (Claude on Amazon Bedrock)
 *
 * API Endpoints:
 *   POST /assistant                 body: { message, history?, language? }
 *        -> { reply, productIds }   (style advice grounded in the live catalog)
 *   POST /products/{id}/insights    body: { language? }
 *        -> { features, season, tip }   (AI-generated product sheet)
 *
 * Bedrock is billed per token and has no free tier, so the function is off
 * unless the stack is deployed with EnableAI=true. While off it answers 503 and
 * the frontend falls back to its local (free) assistant.
 */

import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const claude = new AnthropicBedrock({ awsRegion: process.env.AWS_REGION });

const TABLE_NAME = process.env.PRODUCTS_TABLE;
const MODEL_ID = process.env.BEDROCK_MODEL_ID;
const AI_ENABLED = process.env.AI_ENABLED === 'true';

const LANGUAGES = { es: 'español de México', en: 'English', zh: '简体中文', ja: '日本語' };

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
};
const respond = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });

const ASSISTANT_SCHEMA = {
    type: 'object',
    properties: {
        reply: { type: 'string' },
        productIds: { type: 'array', items: { type: 'string' } }
    },
    required: ['reply', 'productIds'],
    additionalProperties: false
};

const INSIGHTS_SCHEMA = {
    type: 'object',
    properties: {
        features: { type: 'array', items: { type: 'string' } },
        season: { type: 'string' },
        tip: { type: 'string' }
    },
    required: ['features', 'season', 'tip'],
    additionalProperties: false
};

async function askClaude({ system, messages, schema }) {
    const response = await claude.messages.create({
        model: MODEL_ID,
        max_tokens: 16000,
        output_config: { effort: 'low', format: { type: 'json_schema', schema } },
        system,
        messages
    });

    if (response.stop_reason === 'refusal') {
        return null;
    }
    const text = response.content.find((block) => block.type === 'text')?.text;
    return text ? JSON.parse(text) : null;
}

function catalogSummary(products) {
    return products
        .map((p) => `- id=${p.productId} | ${p.name} | ${p.category} | $${p.price} MXN | stock ${p.stock ?? 0} | ${p.description}`)
        .join('\n');
}

async function handleAssistant(body) {
    const message = String(body.message || '').slice(0, 1000);
    if (!message.trim()) {
        return respond(400, { error: 'El mensaje es obligatorio' });
    }
    const language = LANGUAGES[body.language] ? body.language : 'es';

    const { Items: products = [] } = await dynamodb.send(new ScanCommand({ TableName: TABLE_NAME }));

    // Keep only well-formed prior turns, newest last, alternating roles.
    const history = Array.isArray(body.history)
        ? body.history
            .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string')
            .slice(-10)
        : [];
    while (history.length && history[0].role !== 'user') history.shift();

    const system = [
        'Eres el asistente de estilo de TechModa, una tienda en línea de moda urbana juvenil en México.',
        'Ayudas a armar outfits y a elegir productos del catálogo según ocasión, presupuesto, talla de estilo y gustos.',
        `Responde en ${LANGUAGES[language]}, en un tono cercano y breve (máximo 4 oraciones).`,
        'Recomienda solo productos del catálogo; pon sus ids en productIds (máximo 4, sin productos agotados).',
        'Si piden algo que no es de moda o de la tienda, redirige amablemente a la tienda y deja productIds vacío.',
        '',
        'Catálogo actual:',
        catalogSummary(products)
    ].join('\n');

    const result = await askClaude({
        system,
        messages: [...history, { role: 'user', content: message }],
        schema: ASSISTANT_SCHEMA
    });
    if (!result) {
        return respond(200, { reply: 'Prefiero no responder eso, pero con gusto te ayudo a encontrar tu próximo outfit.', productIds: [] });
    }

    const valid = new Set(products.filter((p) => (p.stock ?? 0) > 0).map((p) => p.productId));
    return respond(200, { reply: result.reply, productIds: result.productIds.filter((id) => valid.has(id)).slice(0, 4) });
}

async function handleInsights(productId, body) {
    const language = LANGUAGES[body.language] ? body.language : 'es';
    const { Item: product } = await dynamodb.send(new GetCommand({ TableName: TABLE_NAME, Key: { productId } }));
    if (!product) {
        return respond(404, { error: 'Producto no encontrado' });
    }

    const result = await askClaude({
        system: [
            'Eres el editor de producto de TechModa, una tienda de moda urbana juvenil.',
            `Escribe en ${LANGUAGES[language]}. Sé concreto y no inventes certificaciones ni materiales que no se deduzcan del producto.`,
            'features: 3 a 4 características cortas. season: temporada u ocasión ideal en una frase. tip: un consejo de estilo para combinarlo.'
        ].join('\n'),
        messages: [{
            role: 'user',
            content: `Producto: ${product.name}\nCategoría: ${product.category}\nPrecio: $${product.price} MXN\nDescripción: ${product.description}`
        }],
        schema: INSIGHTS_SCHEMA
    });
    if (!result) {
        return respond(502, { error: 'No se pudo generar la ficha' });
    }
    return respond(200, { productId, language, ...result });
}

export const handler = async (event) => {
    console.log('Event:', JSON.stringify({ resource: event.resource, path: event.path }));

    if (!AI_ENABLED) {
        return respond(503, { error: 'IA deshabilitada', message: 'Despliega con EnableAI=true para usar Bedrock' });
    }

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return respond(400, { error: 'JSON inválido' });
    }

    try {
        if (event.resource === '/products/{id}/insights') {
            return await handleInsights(event.pathParameters?.id, body);
        }
        return await handleAssistant(body);
    } catch (error) {
        console.error('Error calling Claude on Bedrock:', error);
        return respond(500, { error: 'Error del asistente', message: error.message });
    }
};
