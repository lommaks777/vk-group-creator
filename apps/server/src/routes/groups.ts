import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';

interface GroupStatusRequest {
  Params: {
    id: string;
  };
}

export async function initRoutes(fastify: FastifyInstance) {
  // Получение статуса создания группы
  fastify.get<GroupStatusRequest>('/:id/status', async (request, reply) => {
    try {
      const { id } = request.params;
      
      // Получаем задачу из очереди
      const job = await fastify.groupCreationQueue.getJob(id);
      
      if (!job) {
        return reply.status(404).send({ error: 'Job not found' });
      }
      
      const progress = job.progress as any;
      const result = job.returnvalue;
      const failedReason = job.failedReason;
      
      return {
        id: job.id,
        status: await job.getState(),
        progress,
        result,
        error: failedReason,
        created_at: new Date(job.timestamp),
        updated_at: new Date(job.processedOn || job.timestamp),
      };
    } catch (error) {
      logger.error('Get group status error', error);
      reply.status(500).send({ error: 'Failed to get group status' });
    }
  });

  // Получение всех групп ученика
  fastify.get('/student/:studentId', async (request, reply) => {
    try {
      const { studentId } = request.params as { studentId: string };
      
      const groups = await fastify.prisma.group.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
      });
      
      return { groups };
    } catch (error) {
      logger.error('Get student groups error', error);
      reply.status(500).send({ error: 'Failed to get student groups' });
    }
  });

  // Отзыв доступа к группе
  fastify.delete('/:id/revoke', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const group = await fastify.prisma.group.findUnique({
        where: { id },
        include: { student: true },
      });
      
      if (!group) {
        return reply.status(404).send({ error: 'Group not found' });
      }
      
      // Здесь можно добавить логику для отзыва доступа через VK API
      // Например, удаление callback сервера, отключение автоответчика и т.д.
      
      await fastify.prisma.group.update({
        where: { id },
        data: { status: 'revoked' },
      });
      
      logger.info('Group access revoked', { groupId: id });
      
      return { success: true, message: 'Access revoked successfully' };
    } catch (error) {
      logger.error('Revoke group access error', error);
      reply.status(500).send({ error: 'Failed to revoke access' });
    }
  });
}
