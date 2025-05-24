const plaidBaseUrl = process.env.ENV === "production" ? "https://api.plaid.com" : "https://sandbox.plaid.com";
const plaidCreateLinkUrl = `${plaidBaseUrl}/link/token/create`;
const plaidClientId = process.env.PLAID_CLIENT_ID ?? '';
const plaidSecret = process.env.PLAID_SECRET ?? '';


if (!plaidClientId || !plaidSecret) {
    throw new Error('PLAID_CLIENT_ID or PLAID_SECRET is not set');
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const baseUrl = url.origin;
    const userId = url.searchParams.get('userId') ?? 'unique_user_id_1234abcd';
    const redirectUri = url.searchParams.get('redirectUri') ?? `${baseUrl}/universal-link/jump-to-my-app.html`;
    
    // const webhookUrl = `${baseUrl}/plaid/webhook`;
    // const redirectUri = `${baseUrl}/universal-link/jump-to-my-app.html`;
    try {
        console.log('plaid-create-link-token+api');
        console.log(plaidBaseUrl);
        console.log(plaidCreateLinkUrl);

        const userRequest = {
            client_name: 'InvestAssist',
            client_id: plaidClientId,
            secret: plaidSecret,
            country_codes: ['US'],
            language: 'en',

            user: {
                client_user_id: userId,
                // Optionally add phone_number or email_address for delivery
            },

            products: ['transactions'],
            // webhook: webhookUrl,
            hosted_link: {
                is_mobile_app: true,
                completion_redirect_uri: redirectUri, // custom scheme
                // delivery_method: 'sms', // optional
                // url_lifetime_seconds: 900, // optional
            },
            redirect_uri: redirectUri,

            transactions: {
                days_requested: 730
            },

            account_filters: {
                depository: {
                    account_subtypes: ['checking', 'savings']
                },
                credit: {
                    account_subtypes: ['credit card']
                }
            },

            additional_consented_products: ["auth"]

        };
        console.log(JSON.stringify(userRequest));
        const response = await fetch(plaidCreateLinkUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userRequest),
        });
        const data = await response.json();
        console.log(data);
        // Return only the hosted_link_url and link_token to the frontend
        return Response.json({
            hosted_link_url: data.hosted_link_url,
            link_token: data.link_token,
            expiration: data.expiration,
        });
    } catch (error) {
        return Response.json({ error: 'Failed to create link token:' + error }, { status: 500 });
    }
}
