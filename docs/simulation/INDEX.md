# 📑 PROTEK Documentation Index

## 📊 Current Status
**Simulation Status**: ✅ **RUNNING**  
**Last Updated**: December 10, 2025  
**All Services**: ✅ **OPERATIONAL**

---

## 📚 Documentation Files

### 🎯 Start Here
1. **[QUICK_START.sh](./QUICK_START.sh)** - ⭐ Quick reference with all essential commands
   - Server endpoints
   - Test prediction examples
   - Environment setup
   - Monitoring commands

2. **[README_SIMULATION.md](./README_SIMULATION.md)** - Complete overview
   - Architecture overview
   - Dataset information
   - Setup instructions
   - API examples
   - Troubleshooting

### 📖 Detailed Guides
3. **[SIMULATION_GUIDE.md](./SIMULATION_GUIDE.md)** - Comprehensive simulation guide
   - Data flow explanation
   - How to run simulation
   - Prediction payload format
   - Test cases
   - Database schema
   - Log monitoring

4. **[SIMULATION_STATUS.md](./SIMULATION_STATUS.md)** - Real-time status report
   - Current process metrics
   - Server status
   - Database connection info
   - Data flow pipeline
   - Performance metrics

### 🛠️ Utility Scripts
5. **[run-full-simulation.sh](./run-full-simulation.sh)** - Execute complete simulation
   - Checks both servers running
   - Starts 40,000+ row simulation
   - Monitors progress
   - Tests predictions

6. **[monitor-simple.sh](./monitor-simple.sh)** - Simple monitoring dashboard
   - Real-time CPU/Memory tracking
   - Process status
   - Timestamp monitoring

7. **[test-prediction.sh](./test-prediction.sh)** - Prediction testing script
   - Multiple test cases
   - Result analysis
   - Success rate calculation

8. **[run-simulation.sh](./run-simulation.sh)** - Basic simulation runner
   - Server checks
   - Simulation startup
   - Sample prediction test

---

## 🚀 Quick Navigation

### For First-Time Users
```bash
# Step 1: Read quick start
cat QUICK_START.sh

# Step 2: Understand architecture
cat README_SIMULATION.md

# Step 3: Run simulation
./run-full-simulation.sh
```

### For Monitoring
```bash
# Option 1: Simple monitoring
./monitor-simple.sh

# Option 2: Process check
ps aux | grep "python -m src.main"

# Option 3: Logs
tail -f ml-api/ml-api.log
```

### For API Testing
```bash
# View Swagger UI
http://localhost:4000/api-docs    # Backend
http://localhost:8000/docs        # ML API

# Test with curl (see QUICK_START.sh)
curl -X POST http://localhost:4000/api/predict ...
```

---

## 📊 System Information

### Server Endpoints
| Service | Port | Endpoint |
|---------|------|----------|
| Backend | 4000 | http://localhost:4000 |
| ML API | 8000 | http://localhost:8000 |
| Database | 45481 | maglev.proxy.rlwy.net |

### Current Status
- **ML API**: ✅ Running (port 8000)
- **Backend**: ✅ Running (port 4000)
- **Database**: ✅ Connected (Railway PostgreSQL)
- **Simulation**: ✅ Running (background task)

### Key Metrics
- **Dataset**: 40,000+ rows
- **Processing**: ~59% CPU, <1% Memory
- **Expected Time**: ~10 minutes
- **Database Tables**: sensor_data, prediction_results, alerts

---

## 🎯 Common Tasks

### Start Everything
```bash
# Terminal 1: ML API
cd ml-api && source venv/bin/activate && python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000

# Terminal 2: Backend
cd backend && npm run dev

# Terminal 3: Run simulation
./run-full-simulation.sh
```

### Stop Simulation
```bash
curl -X GET http://localhost:8000/api/stop-simulation
```

### Monitor Progress
```bash
./monitor-simple.sh
```

### Test Prediction
```bash
./test-prediction.sh
# Or manual test:
curl -X POST http://localhost:4000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"Machine_ID":"M-001","Type":"H","Air_Temp":298.5,...}'
```

### Check Logs
```bash
tail -f ml-api/ml-api.log
```

---

## 📁 File Structure Summary

```
capstone-protek/
├── 📄 README_SIMULATION.md       ← Complete overview
├── 📄 SIMULATION_GUIDE.md        ← Detailed guide
├── 📄 SIMULATION_STATUS.md       ← Current status
├── 📄 QUICK_START.sh             ← Quick reference
├── 📄 INDEX.md                   ← This file
├── 🔧 run-full-simulation.sh     ← Main simulation script
├── 🔧 run-simulation.sh          ← Basic simulation
├── 🔧 monitor-simple.sh          ← Monitoring dashboard
├── 🔧 test-prediction.sh         ← Prediction tests
├── 🚀 ml-api/                    ← FastAPI server
├── 🔨 backend/                   ← Express server
├── ⚛️  frontend/                  ← React app
└── 📦 docker-compose.yml         ← Container config
```

---

## 🔍 Feature Overview

### ML Model
- ✅ Remaining Useful Life (RUL) Estimation
- ✅ Failure Probability Prediction
- ✅ Risk Assessment
- ✅ Feature Engineering (rolling averages, power metrics)

### Database
- ✅ Real-time Data Storage
- ✅ Sensor History Tracking
- ✅ Alert Management
- ✅ Prediction Logging

### APIs
- ✅ RESTful Endpoints
- ✅ Swagger Documentation
- ✅ CORS Support
- ✅ Error Handling

### Simulation
- ✅ 40,000+ Sensor Records
- ✅ Background Processing
- ✅ 100x Acceleration
- ✅ Real-time Database Writes

---

## ⚡ Performance Stats

| Metric | Value |
|--------|-------|
| **Total Records** | 40,000+ |
| **Processing Time** | ~10 minutes |
| **CPU Usage** | 50-70% |
| **Memory Usage** | <1% |
| **Prediction Speed** | ~100ms |
| **Database** | PostgreSQL (Railway) |

---

## 🆘 Troubleshooting Guide

### Common Issues & Solutions

**Port Already in Use**
```bash
lsof -i :4000  # Check what's using port 4000
kill -9 <PID>   # Kill the process
```

**Database Connection Failed**
```bash
# Check .env
cat backend/.env
cat ml-api/.env

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**High CPU Usage**
```bash
# Normal (50-70% during simulation)
# Check processes
ps aux | grep python
```

**Model Not Found**
```bash
# Required: ml-api/src/models/maintenance_brain.pkl
# If missing, run training notebook
# ml-api/notebooks/2_Model_Training.ipynb
```

See **SIMULATION_GUIDE.md** for more detailed troubleshooting.

---

## 📞 Support Resources

1. **Documentation**: Check INDEX.md, SIMULATION_GUIDE.md
2. **API Docs**: http://localhost:4000/api-docs, http://localhost:8000/docs
3. **Logs**: `tail -f ml-api/ml-api.log`
4. **Monitoring**: `./monitor-simple.sh`
5. **Testing**: `./test-prediction.sh`

---

## 🎓 Learning Path

**Beginner**
1. Read QUICK_START.sh
2. Review SIMULATION_STATUS.md
3. Run ./run-full-simulation.sh

**Intermediate**
1. Read README_SIMULATION.md
2. Study SIMULATION_GUIDE.md
3. Explore API Swagger docs
4. Test predictions with curl

**Advanced**
1. Review backend code: `backend/src/`
2. Review ML API code: `ml-api/src/`
3. Analyze database schema
4. Customize ML model

---

## ✅ Verification Checklist

Use this to verify everything is working:

- [x] ML API running (port 8000)
- [x] Backend running (port 4000)
- [x] Database connected
- [x] Dataset loaded (40,000+ rows)
- [x] Simulation running
- [x] Predictions working
- [x] Database writing data

---

## 📝 Document Index by Purpose

### If I want to...

| Need | Document |
|------|----------|
| **Quick setup** | QUICK_START.sh |
| **Understand system** | README_SIMULATION.md |
| **Run simulation** | run-full-simulation.sh |
| **Monitor progress** | monitor-simple.sh |
| **Detailed guide** | SIMULATION_GUIDE.md |
| **Current status** | SIMULATION_STATUS.md |
| **Check everything** | INDEX.md (this file) |
| **Test predictions** | test-prediction.sh |

---

## 🚀 Quick Command Reference

```bash
# Start services
./run-full-simulation.sh

# Monitor simulation
./monitor-simple.sh

# Test prediction
curl -X POST http://localhost:4000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"Machine_ID":"M-001","Type":"H","Air_Temp":298.5,...}'

# Stop simulation
curl -X GET http://localhost:8000/api/stop-simulation

# Check status
ps aux | grep "python -m src.main"

# View logs
tail -f ml-api/ml-api.log

# API Documentation
open http://localhost:4000/api-docs
open http://localhost:8000/docs
```

---

**Generated**: December 10, 2025  
**Status**: ✅ **COMPLETE & UPDATED**  
**Next Review**: Upon next simulation run

