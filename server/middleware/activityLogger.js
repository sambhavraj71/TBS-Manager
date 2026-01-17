const Activity = require('../models/Activity');

const logActivity = async (req, res, next) => {
  // Skip logging for these methods
  const skipMethods = ['GET', 'OPTIONS', 'HEAD'];
  
  if (skipMethods.includes(req.method) || !req.user) {
    return next();
  }

  const originalSend = res.send;
  res.send = async function(data) {
    try {
      let entityType = 'system';
      let entityId = null;
      let entityName = null;
      let action = 'view';
      let details = '';

      // Determine entity type from URL
      if (req.originalUrl.includes('/clients')) {
        entityType = 'client';
      } else if (req.originalUrl.includes('/projects')) {
        entityType = 'project';
      } else if (req.originalUrl.includes('/users')) {
        entityType = 'user';
      }

      // Determine action from method
      switch (req.method) {
        case 'POST':
          action = 'create';
          break;
        case 'PUT':
        case 'PATCH':
          action = 'update';
          break;
        case 'DELETE':
          action = 'delete';
          break;
      }

      // Extract entity details from request body or params
      if (req.body.name) {
        entityName = req.body.name;
      }
      if (req.params.id) {
        entityId = req.params.id;
      }

      // Create activity log
      await Activity.create({
        user: req.user._id,
        action,
        entityType,
        entityId,
        entityName,
        details: `${action} ${entityType}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    } catch (error) {
      console.error('Activity logging error:', error);
    }

    originalSend.call(this, data);
  };

  next();
};

module.exports = logActivity;