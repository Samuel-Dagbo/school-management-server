import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (userId, action, details, req) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      details,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent') || 'Unknown'
    });
  } catch (error) {
    console.error('Activity logging failed:', error.message);
  }
};

export const activityLogger = (action) => {
  return async (req, res, next) => {
    const originalSend = res.json;
    
    res.json = function(body) {
      if (body.success && req.user) {
        const details = {
          method: req.method,
          path: req.path,
          params: req.params,
          query: req.query
        };
        
        setImmediate(() => 
          logActivity(req.user._id, action, details, req)
        );
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  };
};

export default { logActivity, activityLogger };