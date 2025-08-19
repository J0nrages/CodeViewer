import { projectRoutes } from './projects.js';
import { fileRoutes } from './files.js';
import { analysisRoutes } from './analysis.js';

export async function registerRoutes(fastify) {
  // Register API routes with prefix
  await fastify.register(async function (fastify) {
    await fastify.register(projectRoutes);
    await fastify.register(fileRoutes);
    await fastify.register(analysisRoutes);
  }, { prefix: '/api/v1' });
}