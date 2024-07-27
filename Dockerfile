# 使用本地Nginx基础镜像
FROM 192.168.0.80/kr-docker/nginx:1.25

# 设置相关环境变量
ENV RUN_GROUP nginx
ENV DATA_DIR /data/dist
ENV LOG_DIR /data/log/nginx

RUN mkdir /data/log/nginx -p
RUN chown nginx.nginx -R /data/log/nginx

# 将构建的资源文件复制到容器内
COPY ./dist /data/dist

# 暴露端口
EXPOSE 80
ENTRYPOINT nginx -g "daemon off;"
