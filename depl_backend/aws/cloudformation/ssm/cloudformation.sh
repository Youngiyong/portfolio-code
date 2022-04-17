#!/bin/bash

aws cloudformation \
deploy \
--template-file cloudformation.yml \
--stack-name ssm-parameter-dev-rds-port \
--capabilities CAPABILITY_NAMED_IAM
