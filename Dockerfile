# Version: 1.1.0.dev
FROM node:6.3.0
MAINTAINER Wang Zishi <ynh.2@outlook.com>
COPY . /usr/src
WORKDIR /usr/src
EXPOSE 3000
ENTRYPOINT ["npm", "run"]
CMD ["start"]
