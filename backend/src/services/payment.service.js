const prisma = require("../config/prisma");

const paymentInclude = {
  lease: {
    include: {
      application: {
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              landlordId: true,
            },
          },
          tenant: { select: { id: true, name: true, email: true } },
        },
      },
    },
  },
};

function createError(statusCode, publicMessage) {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
}

async function createPayment(landlordId, { leaseId, amount, dueDate }) {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    include: { application: { include: { property: true } } },
  });

  if (!lease) throw createError(404, "Lease not found.");
  if (lease.application.property.landlordId !== landlordId)
    throw createError(
      403,
      "You do not have permission to create a payment for this lease.",
    );
  if (Number(amount) !== Number(lease.monthlyRent))
    throw createError(400, "Payment amount must match the lease monthly rent.");

  return prisma.payment.create({
    data: { leaseId, amount: lease.monthlyRent, dueDate, status: "PENDING" },
    include: paymentInclude,
  });
}

function listMyPayments(userId, role) {
  const where =
    role === "LANDLORD"
      ? { lease: { application: { property: { landlordId: userId } } } }
      : { lease: { application: { tenantId: userId } } };
  return prisma.payment.findMany({
    where,
    include: paymentInclude,
    orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
  });
}

async function updatePaymentStatus(id, landlordId, status) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      lease: { include: { application: { include: { property: true } } } },
    },
  });
  if (!payment) throw createError(404, "Payment not found.");
  if (payment.lease.application.property.landlordId !== landlordId)
    throw createError(
      403,
      "You do not have permission to update this payment.",
    );

  return prisma.payment.update({
    where: { id },
    data: { status, paidDate: status === "PAID" ? new Date() : null },
    include: paymentInclude,
  });
}

module.exports = { createPayment, listMyPayments, updatePaymentStatus };
