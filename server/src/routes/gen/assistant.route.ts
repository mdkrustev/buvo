import { BaseRoute, RouteConfig, AuthContext } from "../../lib/router";
import { UserRole } from "../../models/enums/user-role.enum";

interface Service {
    title: string;
    description: string;
    priceFrom: number;
    priceTo: number;
    currency: string;
    duration: string;
}

const COMPANY_SERVICES: Service[] = [
    {
        title: "Web Design",
        description: "Custom website design with modern UI/UX, responsive layout and brand identity integration.",
        priceFrom: 500,
        priceTo: 2000,
        currency: "EUR",
        duration: "2-4 weeks"
    },
    {
        title: "Web Development",
        description: "Full-stack web application development using modern technologies like React, Node.js and cloud infrastructure.",
        priceFrom: 1000,
        priceTo: 8000,
        currency: "EUR",
        duration: "4-12 weeks"
    },
    {
        title: "SEO Optimization",
        description: "Complete SEO audit and optimization including on-page, off-page and technical SEO to improve search rankings.",
        priceFrom: 300,
        priceTo: 1000,
        currency: "EUR",
        duration: "1-3 months"
    },
    {
        title: "Social Media Management",
        description: "Monthly social media management including content creation, posting schedule and analytics reporting.",
        priceFrom: 200,
        priceTo: 800,
        currency: "EUR",
        duration: "Monthly subscription"
    },
    {
        title: "Brand Identity",
        description: "Complete brand identity package including logo design, color palette, typography and brand guidelines.",
        priceFrom: 400,
        priceTo: 1500,
        currency: "EUR",
        duration: "1-3 weeks"
    }
];

const CLIENT_INQUIRY = `Здравейте, интересувам се от създаването на нов уебсайт за моя ресторант.
Имам нужда от нещо модерно и елегантно, където клиентите да могат да разглеждат менюто ни, да правят резервации и да се свързват с нас.
Можете ли да ми разкажете повече за вашите услуги и цени? Също така, колко време би отнело изпълнението на проекта?`;

export class AssistantRoute extends BaseRoute {

    readonly config: RouteConfig = {
        method: "GET",
        path: "/gen/assistant",
        roles: [UserRole.USER]
    };

    async handler({ user, env }: AuthContext): Promise<Response> {

        const servicesContext = COMPANY_SERVICES.map(s =>
            `- ${s.title}: ${s.description} Price: ${s.priceFrom}-${s.priceTo} ${s.currency}. Duration: ${s.duration}.`
        ).join('\n');

        const systemPrompt = `You are a professional and polite business assistant for a digital agency.
Your job is to respond to client inquiries in a warm, professional and helpful manner.
Always respond in the same language the client uses.
Always start your response with a polite greeting, addressing the client formally (e.g. "Hello," or the equivalent in their language).
Always end your response with a polite closing such as "We wish you a wonderful day and look forward to hearing from you." or the equivalent in their language, followed by the company sign-off "Best regards, The Team".
Based on the client's inquiry, suggest the most relevant services and provide clear pricing information.
Keep responses concise, structured and professional.
Use a warm but formal tone throughout.
Never use slang or overly casual language.

Here are the services we offer:
${servicesContext}`;

        const response = await env.AI.run(
            '@cf/meta/llama-3.1-8b-instruct',
            {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: CLIENT_INQUIRY }
                ],
                max_tokens: 1024,
            }
        ) as { response: string };

        return new Response(JSON.stringify({
            inquiry: CLIENT_INQUIRY,
            reply: response.response,
            suggestedServices: COMPANY_SERVICES
        }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }
}