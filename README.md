# passwordless-magic-links-cognito-demo

How to implement passwordless login using magic links with Cognito.

If you want to deploy this in your AWS account and try it out then you need to:

1. Create and verify a domain identity in SES, see [here](https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html)

2. In the `serverless.yml`, replace `custom.domain` with your SES domain.

3. Run `npm ci` at the project root to restore project dependencies.

4. Run `npx sls deploy` at the project root to deploy the project to the `eu-west-1` region.
