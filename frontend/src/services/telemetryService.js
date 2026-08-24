import api from './api';

export const telemetryService = {
  getTelemetry: async () => {
    const res = await api.get('/telemetry');
    return res.data;
  },
  
  triggerSync: async () => {
    const res = await api.post('/telemetry/sync');
    return res.data;
  },
};
