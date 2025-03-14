# HelloPrint Assessment  

Thank you for giving me this opportunity. I have completed the assessment as per the given instructions.  

## 🔹 Solution Overview  

The solution consists of the following main components:  

1. **Application (Node.js):**  
   - Serves a static web page.  
   - Implements business logic to interact with PostgreSQL and Redis.  
   - Provides APIs to insert and retrieve data.  

2. **PostgreSQL & Redis:**  
   - **PostgreSQL** stores the data.  
   - **Redis** acts as a caching layer to optimize database queries.  
   - Both services are deployed using Helm charts in a Kubernetes cluster.  

---

## 📂 Directory Structure  

```
├── Dockerfile
├── app.js
├── db_migration.sql
├── build_deploy_stack.sh
├── docker-compose.yaml
├── environment_file
├── helm
│   ├── node-app
│   │   ├── Chart.yaml
│   │   ├── charts
│   │   ├── templates
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   └── values.yaml
│   └── postgres
│       ├── Chart.yaml
│       ├── templates
│       │   └── statefulset.yaml
│       └── values.yaml
├── package-lock.json
├── package.json
├── public
│   └── index.html
└── secrets
    └── secrets.yaml
```

---

## 🚀 Deployment Instructions  

### **Prerequisites**  
Ensure the following are set up before deployment:  

✔️ A **Kubernetes cluster** (I used Docker Desktop's built-in Kubernetes).  
✔️ Helm installed on your system.  

### **Step 1: Deploy the application, database, and cache**  
Run the following command to build the application and deploy all components:  

```bash
./build_deploy_stack.sh
```

### **Step 2: Run Database Migration**  
To create the database table and seed initial data, follow these steps:  

1️⃣ **Port-forward PostgreSQL Service:**  
```bash
kubectl port-forward svc/postgres-postgres 5432:5432
```

2️⃣ **Run the migration script:**  
```bash
source environment_file
PGPASSWORD=$POSTGRES_PASSWORD psql --host 127.0.0.1 -U admin -d helloprint -p 5432 -f db_migration.sql
```

### **Step 3: Access the Application**  
Open a browser and go to:  
```
http://localhost
```

### **Step 4: Using the Application**  
- **Insert Data:** Enter a value in the input box and click **Submit** to store it in PostgreSQL.  
- **Retrieve Data:** Click **"Get Data"** to fetch and display all stored records.  
  - If data is available in Redis, it will be served from the cache.  
  - If Redis does not have the data, it will be fetched from PostgreSQL, stored in Redis, and then served.  

---

## 📜 Logging & Observability  

The application logs important events, including cache hits/misses and database operations.  

### **Sample Logs:**  

```bash
> start
> node app.js

{"level":"info","message":"Server running on port 5001","timestamp":"2025-03-14T22:19:32.747Z"}
{"level":"info","message":"POST /put_data request received","requestBody":{"id":1741990780834,"name":"tejas"},"timestamp":"2025-03-14T22:19:40.853Z"}
{"level":"info","message":"New data inserted and cache updated","timestamp":"2025-03-14T22:19:40.872Z"}
{"level":"info","message":"GET /get_data request received","timestamp":"2025-03-14T22:19:44.241Z"}
{"level":"info","message":"Fetching data from Redis","timestamp":"2025-03-14T22:19:44.242Z"}
{"level":"info","message":"Cache miss, fetching data from PostgreSQL","timestamp":"2025-03-14T22:19:44.243Z"}
{"level":"info","message":"Data cached in Redis","timestamp":"2025-03-14T22:19:44.244Z"}
```

---

## 🔧 **Technical Decisions & Justifications**  

✅ **Node.js for API & Static Web Serving:**   
- Chosen for its lightweight nature and seamless integration with Redis and PostgreSQL.  

✅ **Helm Charts for Deployment:**  
- Redis deployed via **Bitnami Helm charts**.
- PostgreSQL & Node.js application packaged in a **custom Helm chart** to maintain flexibility.  

✅ **Custom PostgreSQL Helm Chart:**  
- Initially tried using Bitnami's PostgreSQL chart but faced authentication issues, so a custom Helm chart was created.  

✅ **Secrets Management (For Dev Only):**  
- Secrets (like DB credentials) are stored in the repo, but ideally, a production system should use AWS Secrets Manager or HashiCorp Vault.  

---

## 🔥 Possible Improvements  

🔹 **Secrets Management**  
- Currently, secrets are stored in the repository for simplicity.  
- A best practice is to store secrets securely in AWS Secrets Manager, HashiCorp Vault, or Kubernetes External Secrets.  

🔹 **Optimized Docker Image**  
- The current Dockerfile can be improved by using a **multi-stage build** to reduce image size.  

🔹 **CI/CD Integration**  
- Right now, deployment is managed via a shell script.  
- A proper **CI/CD pipeline** (GitHub Actions, GitLab CI/CD, or Jenkins) can automate the build and deployment process.  

🔹 **Observability Stack (Monitoring & Alerts)**  
- **Prometheus & Grafana** can be used to monitor application metrics and performance.  
- Alerts can be set up for database query failures, Redis cache misses, etc.  

🔹 **Centralized Logging**  
- Currently, logs are written locally.  
- A **centralized log management system** (e.g., **ELK Stack, Loki, or CloudWatch**) would be beneficial.  

---

## ✅ **Conclusion**  

This solution is designed for **scalability, performance, and maintainability** while keeping the implementation simple. The **Helm-based deployment** makes it easy to run on any Kubernetes cluster. Further enhancements such as **CI/CD integration, observability, and secret management** can make it production-ready.  

🚀 **Thanks again for the opportunity! I look forward to your feedback.**  
