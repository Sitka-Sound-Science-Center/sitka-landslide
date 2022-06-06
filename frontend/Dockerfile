FROM node:16-bullseye-slim

RUN apt-get update && \
    apt-get install -y awscli && \
    apt-get clean

WORKDIR /app

# Install packages
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

# Copy code. Annoyingly, you can't copy specific directories all at once. Directory args are
# always treated as "copy the contents of this directory".
COPY components components/
COPY content content/
COPY data data/
COPY pages pages/
COPY public public/
COPY styles styles/
COPY next.config.js ./

CMD yarn export && \
    echo "Uploading to S3..." && \
    aws s3 sync --delete --only-show-errors out/ s3://sitkaproduction/ && \
    echo "Finished"