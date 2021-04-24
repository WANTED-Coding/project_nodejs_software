sudo docker pull lambiengcode/cnpm
sudo docker rm cnpm
sudo docker run -d --name cnpm  -p 3000:3000 --env-file .env lambiengcode/cnpm
sudo docker ps