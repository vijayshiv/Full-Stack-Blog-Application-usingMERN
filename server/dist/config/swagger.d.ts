import swaggerUi from "swagger-ui-express";
declare const swaggerSpec: object;
declare const swaggerUiOptions: {
    explorer: boolean;
    swaggerOptions: {
        persistAuthorization: boolean;
        displayRequestDuration: boolean;
        docExpansion: string;
        filter: boolean;
        showRequestHeaders: boolean;
        showCommonExtensions: boolean;
        tryItOutEnabled: boolean;
    };
    customCss: string;
    customSiteTitle: string;
    customfavIcon: string;
};
export { swaggerSpec, swaggerUi, swaggerUiOptions };
//# sourceMappingURL=swagger.d.ts.map