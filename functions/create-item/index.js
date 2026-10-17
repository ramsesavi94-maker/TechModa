/**
 * CREATE ITEM FUNCTION
 *
 * Purpose: Add a new product to the catalog
 * API Endpoint: POST /products
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');

// Create DynamoDB client
const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.PRODUCTS_TABLE;

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    try {
        // Parse request body
        let body;
        try {
            body = JSON.parse(event.body || '{}');
        } catch {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'JSON inválido',
                    message: 'El cuerpo de la solicitud no es JSON válido'
                })
            };
        }

        // Validate required fields
        const price = parseFloat(body.price);
        const stock = body.stock === undefined ? 0 : parseInt(body.stock, 10);
        if (!body.name || Number.isNaN(price) || price < 0 || Number.isNaN(stock) || stock < 0) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Campos requeridos faltantes',
                    message: 'Los campos "name" y "price" son obligatorios; "price" y "stock" no pueden ser negativos'
                })
            };
        }

        // Create product object with generated ID and timestamps
        const now = new Date().toISOString();
        const product = {
            productId: randomUUID(),
            name: body.name,
            description: body.description || '',
            price,
            category: body.category || '',
            stock,
            imageUrl: body.imageUrl || '',
            createdAt: now,
            updatedAt: now
        };

        // Put item in DynamoDB
        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: product
        });

        await dynamodb.send(command);

        console.log('Product created:', product.productId);

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(product)
        };
    } catch (error) {
        console.error('Error creating product:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Error al crear producto',
                message: error.message
            })
        };
    }
};
