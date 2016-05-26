FROM node:6.1.0
MAINTAINER Wang Zishi <ynh.2@outlook.com>
COPY . /usr/src
WORKDIR /usr/src
EXPOSE 3000
ENTRYPOINT ["npm", "run"]
CMD ["start"]
