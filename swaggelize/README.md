# Associations

- A.hasOne(B, {
  /* options */
});
- A.belongsTo(B, {
  /* options */
});
- A.hasMany(B, {
  /* options */
});
- A.belongsToMany(B, { through: 'C' /* options */ });

The order in which the association is defined is relevant. In other words, the order matters, for the four cases. In all examples above, A is called the source model and B is called the target model. This terminology is important.

The A.hasOne(B) association means that a One-To-One relationship exists between A and B, with the foreign key being defined in the target model (B).

The A.belongsTo(B) association means that a One-To-One relationship exists between A and B, with the foreign key being defined in the source model (A).

The A.hasMany(B) association means that a One-To-Many relationship exists between A and B, with the foreign key being defined in the target model (B).

These three calls will cause Sequelize to automatically add foreign keys to the appropriate models (unless they are already present).

The A.belongsToMany(B, { through: 'C' }) association means that a Many-To-Many relationship exists between A and B, using table C as junction table, which will have the foreign keys (aId and bId, for example). Sequelize will automatically create this model C (unless it already exists) and define the appropriate foreign keys on it.

Note: In the examples above for belongsToMany, a string ('C') was passed to the through option. In this case, Sequelize automatically generates a model with this name. However, you can also pass a model directly, if you have already defined it.