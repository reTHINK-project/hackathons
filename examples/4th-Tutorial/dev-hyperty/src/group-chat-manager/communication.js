
export const CommunicationStatus = {
  OPEN: 'open',
  PENDING: 'pending',
  CLOSED: 'closed',
  PAUSED: 'paused',
  FAILED: 'failed'
};

export let communicationObject = {
  startingTime: '',
  status: '',
  participants: {}
};

export let communicationChildren = {
  "parent" : "communication",
  "listener" : "resources",
  "type" : "HypertyResource"
};
