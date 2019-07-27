# nephridium
An [award-winning](https://devpost.com/software/nephridium) [AWS Serverless Application](https://aws.amazon.com/serverless/) that produces filtered Socrata datasets. _NOT_ affiliated with or endorsed by [Socrata](https://socrata.com/company-info/).

[![CircleCI](https://circleci.com/gh/eebbesen/nephridium.svg?style=svg)](https://circleci.com/gh/eebbesen/nephridium)

## Why?
Hundreds of local, state and federal government organizations use [Socrata](https://socrata.com/company-info/) to share data sets with the public. The public can interact with these datasets in various ways, but these ways may not be intuitive for the general public. And people who understand how to manipulate these datasets don't want to repeat the same manual tasks every day, week or month.

*nephridium* addresses the use case where a dynamically filtered Socrata dataset is desired over time. You specify the Socrata dataset, tell *nephridium* what the date attribute is and you get an HTML table of the data! *nephridium* offers additional parameters you can use to choose which attributes you want to display and to further filter your dataset.


### A use case
#### A repetitive task
A [Saint Paul District Council](https://www.stpaul.gov/residents/live-saint-paul/neighborhoods/district-councils) Executive Director wants to know all of the resident service requests that created in her district the past week. And she wants this information every week.

Saint Paul provides [the data](https://information.stpaul.gov/City-Infrastructure/Resident-Service-Requests-Dataset/3w6i-nfpw), but only in a way where the Executive Director has to enter filter information every single time she visits the site.

#### A one-click solution...
Since *nephridium* uses a look-back date filter, one URL will work in perpetuity. For example, `https://your_aws_url/?district_council=8&time_column=request_date&url=https://information.stpaul.gov/resource/qtkm-psvs` will produce the previous 7 days' results for service requests in District 8.

#### ...that can become a no-click solution
Once an URL is created it can be used with [IFTTT](https://ifttt.com), [Zapier](https://zapier.com/), [cron](https://en.wikipedia.org/wiki/Cron) or any other automation tool to scheule sending of an email with the requested data. Or cause an email to be sent when new data is found.

## The name
[Nephridium](https://en.wikipedia.org/wiki/Nephridium) is like a kidney for an invertabrate. It filters things, just like this project.

## Build an URL for *nephridium*
You will need
* *NEPHRIDIUM_URL:* A deployed version of *nephridium* (see the section `Host your own instance of nephridium` below)
* *DATASET_URL:* A [Socrata](https://socrata.com/company-info/) dataset. See https://www.opendatanetwork.com/search?q=service+requests if you need one to try out. You can also search for you city/state/county, like https://www.opendatanetwork.com/search?q=kalamazoo. Note that the dataset URL is specific -- https://dev.socrata.com/foundry/data.michigan.gov/kkup-j7i5 is an example. The page should have the text `About this dataset` on it and maybe some example URLs.
* *TIME_COLUMN:* A `floating_timestamp` value for your dataset. This is the value that's used to get the last week or two months of entries. If you scroll down on the dataset page to the `Fields` section there should be at least one `floating_timestamp`. On https://dev.socrata.com/foundry/data.michigan.gov/kkup-j7i5 `deadline_date` is the value. Default is two months -- add `timeRange=w` to your URL to limit records to the previous week.

Whew! Now that you have the ingredients it's time to craft the URL you'll be using.

For an example we'll use
* *NEPHRIDIUM_URL:* `https://abcd1234.execute-api.us-east-1.amazonaws.com/Prod/`
* *DATASET_URL:* `https://dev.socrata.com/foundry/data.michigan.gov/kkup-j7i5`
* *TIME_COLUMN:* `deadline_date`

to build our minimal URL (must include a `time_column` and a `url`)

`https://abcd1234.execute-api.us-east-1.amazonaws.com/Prod/?time_column=deadline_date&url=https://dev.socrata.com/foundry/data.michigan.gov/kkup-j7i5`

Make sure DATASET_URL is last!

If we want to further filter the dataset we can do that, too.

### Excluding columns
In our example, let's say we don't want to see the county column. We'll add a `to_remove` parameter for that.

`https://abcd1234.execute-api.us-east-1.amazonaws.com/Prod/?time_column=deadline_date&to_remove=county&url=https://dev.socrata.com/foundry/data.michigan.gov/kkup-j7i5`

And if we want to remove more than one column, we just separate them with a comma (no spaces!). Let's also remove the column that shows whether there's a GPA requirement.

`https://abcd1234.execute-api.us-east-1.amazonaws.com/Prod/?time_column=deadline_date&to_remove=county,gpa_req_y_n&url=https://dev.socrata.com/foundry/data.michigan.gov/kkup-j7i5`

### Filtering data
Let's retrieve only records where you don't have to have graduated to be eligible. We do this by specifying the column name (`grad_y_n`) and a value in the URL.

`https://abcd1234.execute-api.us-east-1.amazonaws.com/Prod/?time_column=deadline_date&grad_y_n=N&url=https://dev.socrata.com/foundry/data.michigan.gov/kkup-j7i5`

### More!
See the Socrata API documentation for more options, especially
* https://dev.socrata.com/docs/filtering.html
* https://dev.socrata.com/docs/queries/


## Host your own instance of *nephridium*
### Requirements

* AWS CLI already configured with at least PowerUser permission
* [NodeJS 8.10+ installed](https://nodejs.org/en/download/)
* [Docker](https://www.docker.com/community-edition) installed and running

### Setup process

#### Installing dependencies

In this example we use `npm` but you can use `yarn` if you prefer to manage NodeJS dependencies:

```bash
cd nephridium
npm install
cd ../
```

#### Local development
*SAM CLI* is used to emulate both Lambda and API Gateway locally and uses our `template.yaml`. You will have to install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) installed and configure using `aws configure` to avoid MissingAuthenticationToken issues.

You can modify *nephridium* to return JSON instead of HTML, internallly filter your dataset(s) to minimize the number of parameters in your users' URLs, format the output (e.g., custom CSS), or restrict who can access the API.

**Invoking function locally through local API Gateway**

https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-local-start-api.html
```bash
sam local start-api --region us-east-1

http://127.0.0.1:3000/?time_column=request_date&url=https://information.stpaul.gov/resource/qtkm-psvs
```

If the previous command ran successfully you should now be able to hit the following local endpoint to invoke your function. Note that CloudFront (but not your local api) returns a 403 when it receives a GET with a body, so you must use query parameters instead.


**Invoke the ReportFunction directly**
Assuming you have event info in a file named event_file.json
```bash
sam local invoke ReportFunction --region us-east-1 --event event_file.json
```

event_file.json
```json
{
    "queryStringParameters": {
        "time_column": "request_date",
        "url": "https://information.stpaul.gov/resource/qtkm-psvs"
    }
}
```


```bash
echo '{"queryStringParameters": {"time_column": "request_date", "url": "https://information.stpaul.gov/resource/qtkm-psvs"}}'  | sam local invoke ReportFunction --region us-east-1
```

### Packaging and deployment

AWS Lambda NodeJS runtime requires a flat folder with all dependencies including the application. SAM will use `CodeUri` property to know where to look up for both application and dependencies:

```yaml
...
    ReportFunction:
        Type: AWS::Serverless::Function
        Properties:
            CodeUri: nephridium/
            ...
```

Firstly, we need a `S3 bucket` where we can upload our Lambda functions packaged as ZIP before we deploy anything - If you don't have a S3 bucket to store code artifacts then this is a good time to create one:

```bash
aws s3 mb s3://BUCKET_NAME
```

In order to _publish_ your application to [the Serverless Application Repository](https://aws.amazon.com/serverless/serverlessrepo/) you'll need to create a policy for your S3 bucket like this sample:
```bash
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service":  "serverlessrepo.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::BUCKET_NAME/*"
        }
    ]
}
```

See https://docs.aws.amazon.com/serverlessrepo/latest/devguide/serverless-app-publishing-applications.html for more details on publishing.

Next, run the following command to package our Lambda function to S3:

```bash
sam package \
    --template-file template.yaml \
    --output-template-file packaged.yaml \
    --s3-bucket BUCKET_NAME
```

Next, the following command will create a Cloudformation Stack and deploy your SAM resources. I've only been able to do this using an IAM user with full administrator rights.

```bash
sam deploy \
    --template-file packaged.yaml \
    --stack-name BUCKET_NAME \
    --capabilities CAPABILITY_IAM
```

Return from package call recommends the following, so you could try it as well:
```bash
aws cloudformation deploy --template-file /private/tmp/sam/nephridium/packaged.yaml --stack-name BUCKET_NAME
```

> **See [Serverless Application Model (SAM) HOWTO Guide](https://github.com/awslabs/serverless-application-model/blob/master/HOWTO.md) for more details in how to get started.**

After deployment is complete you can run the following command to retrieve the API Gateway Endpoint URL:

```bash
aws cloudformation describe-stacks \
    --stack-name BUCKET_NAME \
    --query 'Stacks[].Outputs'
```

### Unit testing

We use `mocha` for testing our code and it is already added in `package.json` under `scripts`, so that we can simply run the following command to run our tests:

```bash
cd nephridium
npm run test
```

### Linting
```bash
npm run lint
```

To have linter fix what it can
```bash
npm run lint -- --fix
```


# Appendix

## AWS CLI commands

AWS CLI commands to package, deploy and describe outputs defined within the cloudformation stack:

```bash
sam package \
    --template-file template.yaml \
    --output-template-file packaged.yaml \
    --s3-bucket BUCKET_NAME

sam deploy \
    --template-file packaged.yaml \
    --stack-name BUCKET_NAME \
    --capabilities CAPABILITY_IAM

aws cloudformation describe-stacks \
    --stack-name BUCKET_NAME --query 'Stacks[].Outputs'
```

In the output from the last command you'll find your API URL on AWS.

```bash
...
        {
            "Description": "API Gateway endpoint URL for Prod stage for Report function",
            "OutputKey": "ReportApi",
            "OutputValue": "https://abcd1234.execute-api.us-east-1.amazonaws.com/Prod/"
        }
...
```

**NOTE**: Alternatively this could be part of package.json scripts section.

## Publishing to [the Serverless Application Repository](https://aws.amazon.com/serverless/serverlessrepo/)

See https://docs.aws.amazon.com/serverlessrepo/latest/devguide/serverless-app-publishing-applications.html for instructions.


## API testing
Providing test examples for local and deployed endpoints

### Bare minimum -- `time_column` and `url`
```bash
curl -vvv 'http://127.0.0.1:3000/?time_column=request_date&url=https://information.stpaul.gov/resource/qtkm-psvs'

curl -vvv 'https://abcd1234.execute-api.us-east-1.amazonaws.com/Prod/?time_column=request_date&url=https://information.stpaul.gov/resource/qtkm-psvs'
```

### Custom parameters in query
```bash
curl -vvv 'http://127.0.0.1:3000/?district_council=8&time_column=request_date&url=https://information.stpaul.gov/resource/qtkm-psvs'

curl -vvv 'https://abcd1234.execute-api.us-east-1.amazonaws.com/Prod/?district_council=8&time_column=request_date&url=https://information.stpaul.gov/resource/qtkm-psvs'
```

### Custom parameters in query with filtered attributes
```bash
curl -vvv -X GET 'http://127.0.0.1:3000/?district_council=8&time_column=request_date&to_remove=count,map_location&url=https://information.stpaul.gov/resource/qtkm-psvs'

curl -vvv 'https://abcd1234.execute-api.us-east-1.amazonaws.com/Prod/?district_council=8&time_column=request_date&to_remove=count,map_location&url=https://information.stpaul.gov/resource/qtkm-psvs'
```

## Accessibility testing
http://wave.webaim.org/report#/https://abcd1234.execute-api.us-east-1.amazonaws.com/Prod/?district_council=8&time_column=request_date&to_remove=count,map_location,see_click_fix_website_submission&url=https://information.stpaul.gov/resource/qtkm-psvs
