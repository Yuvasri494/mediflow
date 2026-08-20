const express = require('express');

const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getDepartments)
  .post(protect, authorize('admin'), createDepartment);

router
  .route('/:id')
  .get(getDepartmentById)
  .put(protect, authorize('admin'), updateDepartment)
  .delete(protect, authorize('admin'), deleteDepartment);

  router.get('/', getDepartments);

module.exports = router;