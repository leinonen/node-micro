# node-micro
Experimenting with microservices in Node.js using Express and Etcd.

Services are registered in etcd.
The api-gateway then queries etcd for available services, and uses a random available server to fulfill the request.

