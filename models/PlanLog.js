module.exports = (sequelize, DataTypes) => {
    const PlanLog = sequelize.define('PlanLog', {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      oldPlan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      newPlan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });
  
    PlanLog.associate = (models) => {
      PlanLog.belongsTo(models.User, { foreignKey: 'userId' });
    };
  
    return PlanLog;
  };
  