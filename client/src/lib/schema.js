import PropTypes from 'prop-types';

// Customer Type
export const CustomerType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  company: PropTypes.string.isRequired,
  contact: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  phone: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  serviceTerritory: PropTypes.string.isRequired,
  machineTypes: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    quantity: PropTypes.number
  })),
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
});

// Product Type
export const ProductType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  specs: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
});

// Opportunity Type
export const OpportunityType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  customerId: PropTypes.number.isRequired,
  productId: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  stage: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  probability: PropTypes.number,
  expectedCloseDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  notes: PropTypes.string,
  assignedTo: PropTypes.string,
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
});

// Activity Type
export const ActivityType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  customerId: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
});

// Maintenance Type
export const MaintenanceType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  customerId: PropTypes.number.isRequired,
  machineId: PropTypes.number.isRequired,
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  type: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  parts: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    cost: PropTypes.number.isRequired
  })),
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
});

// Part Type
export const PartType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  quantity: PropTypes.number.isRequired,
  cost: PropTypes.number.isRequired
});
