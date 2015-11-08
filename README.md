# node-micro
Experimenting with microservices in Node.js using Express and Etcd. This is a work in progress.

## Inspiration
I started this project because I wanted to learn how microservice architecture work,
and how you could implement a simple microservice project using Node.js.

The reason for using etcd is that is was easy to set it up on my Raspberry Pi using Docker.

I will also use Docker to deploy the services as containers, and maybe play with docker compose.


### product-service
Simple REST API to display products. 
Registers itself in etcd on startup, and sends updates to etcd every 5 seconds.
Also sets a TTL in etcd for 10 seconds.

It saves the hostname and port in etcd using a key similar to this:

```
/services/products/9d9551fa-fdc4-48cb-aa70-6d825910d010
```

And uses a uuid to distinguish between services of the same type.

You can start a bunch of services on different ports like this:

```
node index.js --server:port 6000
```

```
node index.js --server:port 7000
```

```
node index.js --server:port 8000
```

### api-gateway
The api-gateway is a simple REST API that queries etcd for available services, and uses a random available server to fulfill the requests.

The query is using the following key in etcd:
`/services/products`

I wanted the API to be easy to use. Look:

```javascript
app.get('/products', (req, res) => {
  serviceRegistry.invokeService('products', '/products')
  .then(products => res.json({ products: products }))
  .catch(err => res.json({ products: [] }));
});
```


## References
https://www.nginx.com/blog/building-microservices-using-an-api-gateway/

http://lukebond.ghost.io/service-discovery-with-etcd-and-node-js/
