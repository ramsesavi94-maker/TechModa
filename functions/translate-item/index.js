/**
 * TRANSLATE ITEM FUNCTION
 *
 * Purpose: Translate a product's name and description with Amazon Translate
 * API Endpoint: POST /products/{id}/translate   body: { "language": "en" }
 *
 * Translations are cached on the item (translations.<lang>) so each text is
 * translated only once, which keeps usage inside the Amazon Translate free tier.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const translate = new TranslateClient({});

const TABLE_NAME = process.env.PRODUCTS_TABLE;
const SUPPORTED = ['en', 'zh', 'ja'];

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
};
const respond = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });

async function translateText(text, language) {
    if (!text) return '';
    const result = await translate.send(new TranslateTextCommand({
        Text: text,
        SourceLanguageCode: 'es',
        TargetLanguageCode: language
    }));
    return result.TranslatedText;
}

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    try {
        const productId = event.pathParameters?.id;
        let body;
        try {
            body = JSON.parse(event.body || '{}');
        } catch {
            return respond(400, { error: 'JSON inválido' });
        }

        const language = body.language;
        if (!productId || !SUPPORTED.includes(language)) {
            return respond(400, {
                error: 'Parámetros inválidos',
                message: `"language" debe ser uno de: ${SUPPORTED.join(', ')}`
            });
        }

        const { Item: product } = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { productId }
        }));
        if (!product) {
            return respond(404, { error: 'Producto no encontrado' });
        }

        // Reuse the cached translation unless the product changed afterwards.
        const cached = product.translations?.[language];
        if (cached && cached.sourceUpdatedAt === product.updatedAt) {
            return respond(200, { productId, language, name: cached.name, description: cached.description });
        }

        const [name, description] = await Promise.all([
            translateText(product.name, language),
            translateText(product.description, language)
        ]);
        const entry = { name, description, sourceUpdatedAt: product.updatedAt };

        await dynamodb.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { productId },
            UpdateExpression: 'SET #translations = if_not_exists(#translations, :empty)',
            ExpressionAttributeNames: { '#translations': 'translations' },
            ExpressionAttributeValues: { ':empty': {} }
        }));
        await dynamodb.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { productId },
            UpdateExpression: 'SET #translations.#lang = :entry',
            ExpressionAttributeNames: { '#translations': 'translations', '#lang': language },
            ExpressionAttributeValues: { ':entry': entry }
        }));

        console.log('Product translated:', productId, language);
        return respond(200, { productId, language, name, description });
    } catch (error) {
        console.error('Error translating product:', error);
        return respond(500, { error: 'Error al traducir producto', message: error.message });
    }
};
