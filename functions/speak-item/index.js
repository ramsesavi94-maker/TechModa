/**
 * SPEAK ITEM FUNCTION
 *
 * Purpose: Read a product description aloud with Amazon Polly (neural voices)
 * API Endpoint: POST /products/{id}/speech   body: { "language": "es" }
 *
 * Returns the MP3 as base64 inside JSON so API Gateway needs no binary setup.
 * Uses the cached translation (see translate-item) for non-Spanish languages.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const polly = new PollyClient({});

const TABLE_NAME = process.env.PRODUCTS_TABLE;

// Neural voices per UI language.
const VOICES = {
    es: { VoiceId: 'Mia', LanguageCode: 'es-MX' },
    en: { VoiceId: 'Joanna', LanguageCode: 'en-US' },
    zh: { VoiceId: 'Zhiyu', LanguageCode: 'cmn-CN' },
    ja: { VoiceId: 'Kazuha', LanguageCode: 'ja-JP' }
};

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
};
const respond = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });

async function streamToBase64(stream) {
    const bytes = await stream.transformToByteArray();
    return Buffer.from(bytes).toString('base64');
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

        const language = body.language || 'es';
        const voice = VOICES[language];
        if (!productId || !voice) {
            return respond(400, { error: 'Parámetros inválidos', message: '"language" debe ser es, en, zh o ja' });
        }

        const { Item: product } = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { productId }
        }));
        if (!product) {
            return respond(404, { error: 'Producto no encontrado' });
        }

        const translated = language === 'es' ? null : product.translations?.[language];
        const name = translated?.name || product.name;
        const description = translated?.description || product.description || '';
        // Polly neural limit is 3000 billed characters per request.
        const text = `${name}. ${description}`.slice(0, 2900);

        const result = await polly.send(new SynthesizeSpeechCommand({
            Engine: 'neural',
            OutputFormat: 'mp3',
            Text: text,
            ...voice
        }));

        return respond(200, {
            productId,
            language,
            contentType: 'audio/mpeg',
            audioBase64: await streamToBase64(result.AudioStream)
        });
    } catch (error) {
        console.error('Error synthesizing speech:', error);
        return respond(500, { error: 'Error al generar audio', message: error.message });
    }
};
