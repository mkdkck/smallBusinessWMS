const { User, Organization, Warehouse, Category, PackageConfig, Product } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Mutation: {
        addUser: async (parent, args) => {
            let organization = await Organization.findOne({ OrgName: args.organization })
            if (!organization) {
                organization = await Organization.create({ OrgName: args.organization })
            }
            console.log(organization)
            const newUser = {
                username: args.username,
                email: args.email,
                password: args.password,
                role: args.role,
                organization: organization._id
            }
            const user = await User.create(newUser);
            const token = signToken(user);
            console.log(user)

            await Organization.findOneAndUpdate(
                { _id: organization._id },
                {
                    $addToSet: { members: { _id: user._id } },
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

            return { token, user };
        },

        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw AuthenticationError;
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw AuthenticationError;
            }

            const token = signToken(user);

            return { token, user };
        },
    }
};

module.exports = resolvers;