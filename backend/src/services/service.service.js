'use strict';

const { ApiError } = require('../utils/apiError');
const serviceRepository = require('../repositories/service.repository');

/** DTO: converte o Decimal `price` para número, facilitando o consumo no front. */
function toServiceDTO(service) {
  if (!service) return null;
  return {
    id: service.id,
    name: service.name,
    price: Number(service.price),
    durationMinutes: service.durationMinutes,
    category: service.category,
    description: service.description,
    imageUrl: service.imageUrl,
    isActive: service.isActive,
    createdAt: service.createdAt,
  };
}

async function listServices({ includeInactive = false } = {}) {
  const services = await serviceRepository.findMany({ includeInactive });
  return services.map(toServiceDTO);
}

async function getService(id) {
  const service = await serviceRepository.findById(id);
  if (!service) throw ApiError.notFound('Serviço não encontrado.');
  return toServiceDTO(service);
}

async function createService(input) {
  const created = await serviceRepository.create(buildData(input));
  return toServiceDTO(created);
}

async function updateService(id, input) {
  const existing = await serviceRepository.findById(id);
  if (!existing) throw ApiError.notFound('Serviço não encontrado.');
  const updated = await serviceRepository.update(id, buildData(input, { partial: true }));
  return toServiceDTO(updated);
}

async function setServiceActive(id, isActive) {
  const existing = await serviceRepository.findById(id);
  if (!existing) throw ApiError.notFound('Serviço não encontrado.');
  const updated = await serviceRepository.setActive(id, isActive);
  return toServiceDTO(updated);
}

/**
 * Remove um serviço. Se houver agendamentos vinculados, não deleta (preserva o
 * histórico) e orienta a desativar — mantém a integridade dos relatórios futuros.
 */
async function deleteService(id) {
  const existing = await serviceRepository.findById(id);
  if (!existing) throw ApiError.notFound('Serviço não encontrado.');

  const refs = await serviceRepository.countAppointmentRefs(id);
  if (refs > 0) {
    throw ApiError.conflict(
      'Este serviço possui agendamentos no histórico. Desative-o em vez de remover.',
    );
  }
  await serviceRepository.remove(id);
}

/** Monta o objeto de dados, ignorando campos undefined no modo parcial (update). */
function buildData(input, { partial = false } = {}) {
  const data = {
    name: input.name,
    price: input.price,
    durationMinutes: input.durationMinutes,
    category: input.category,
    description: input.description,
    imageUrl: input.imageUrl,
  };
  if (!partial) return data;
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
}

module.exports = {
  listServices,
  getService,
  createService,
  updateService,
  setServiceActive,
  deleteService,
};
