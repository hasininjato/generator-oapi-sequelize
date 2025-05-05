const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const { ValidationError } = require('sequelize');

// services for transaction
const createTransaction = async (userId, amount, description) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const transaction = await Transaction.create({
            amount: amount,
            description: description,
            userId: user.id,
        });

        return transaction;
    } catch (error) {
        if (error instanceof ValidationError) {
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                message: err.message
            }));
            throw { name: "ValidationError", errors: validationErrors };
        }
        throw new Error('Error when creating the transaction: ' + error.message);
    }
};

const getUserTransactions = async (userId) => {
    // solution for the part 1 question 4: N+1 problem => Sequelize proposes the eager loading solution to avoid this by including transactions of the user
    try {
        const user = await User.findByPk(userId, {
            attributes: ['fullname', 'email'], // remove password when select
            include: [
                {
                    model: Transaction,
                    as: 'Transactions'
                },
            ],
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    } catch (error) {
        throw new Error('Error when fetching user transactions: ' + error.message);
    }
};

module.exports = {
    createTransaction,
    getUserTransactions,
};
