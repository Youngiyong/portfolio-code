# browny_backend

## Overview

### Architecture
![Architecture](browny.drawio.png)

## Preparation

- install node 12

- git clone https://github.com/Browny9532/browny_backend.git

- yarn global add serverless

- serverless config credentials --provider aws --key [aws access key] --secret [aws secret key]

- yarn install

### Development
#### deployment
- development : yarn deploy && npx sls deploy --stage dev
- production : yarn deploy:prod && npx sls deploy --stage prod

### Doc/Swagger
![swaggerhub](swaggerhub.png)
- https://app.swaggerhub.com 
- ID/PW Notion check

### Test Local
#### sls offline
- yarn offline
- postman + insomnia + api tool test
![offline](offline.png)
![postman](postman.png)
#### invoke local
- sls invoke local -f {serverless.yml function name} -p payload/{payload file}
- sls invoke local -f getuser -p payload/find.json
- sls invoke local -f createuser -p payload/create.json
- ...etc