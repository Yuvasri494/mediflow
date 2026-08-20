const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all departments (auto-creates default list if empty)
// @route   GET /api/departments
// @access  Public / Private
exports.getDepartments = asyncHandler(async (req, res) => {
  let departments = await Department.find().sort({ name: 1 });

  // If no departments exist in DB, create standard defaults so dropdown is never empty
  if (departments.length === 0) {
    departments = await Department.insertMany([
      { name: 'Cardiology', description: 'Heart and cardiovascular care', status: 'Active' },
      { name: 'Neurology', description: 'Brain and nervous system treatment', status: 'Active' },
      { name: 'General Medicine', description: 'Primary health care and diagnostics', status: 'Active' },
      { name: 'Pediatrics', description: 'Child and adolescent healthcare', status: 'Active' },
      { name: 'Orthopedics', description: 'Bone and joint care', status: 'Active' }
    ]);
  }

  res.json({
    success: true,
    count: departments.length,
    data: departments
  });
});

// @desc    Get single department by ID
// @route   GET /api/departments/:id
// @access  Public / Private
exports.getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id).populate({
    path: 'headDoctor',
    populate: { path: 'userId', select: 'name email profilePhoto' }
  });

  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }

  const doctorCount = await Doctor.countDocuments({ specialization: department.name });

  res.json({
    success: true,
    data: {
      ...department.toObject(),
      doctorCount
    }
  });
});

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Admin only)
exports.createDepartment = asyncHandler(async (req, res) => {
  const { name, description, headDoctor, status } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('Department name is required');
  }

  const departmentExists = await Department.findOne({ name: name.trim() });
  if (departmentExists) {
    res.status(400);
    throw new Error('Department with this name already exists');
  }

  const department = await Department.create({
    name: name.trim(),
    description: description ? description.trim() : '',
    headDoctor: headDoctor || null,
    status: status || 'Active'
  });

  res.status(201).json({
    success: true,
    data: department
  });
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin only)
exports.updateDepartment = asyncHandler(async (req, res) => {
  let department = await Department.findById(req.params.id);

  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }

  const { name, description, headDoctor, status } = req.body;

  if (name && name.trim() !== department.name) {
    const existing = await Department.findOne({ name: name.trim() });
    if (existing) {
      res.status(400);
      throw new Error('Another department already exists with this name');
    }
    department.name = name.trim();
  }

  if (description !== undefined) department.description = description.trim();
  if (headDoctor !== undefined) department.headDoctor = headDoctor || null;
  if (status) department.status = status;

  await department.save();

  res.json({
    success: true,
    data: department
  });
});

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin only)
exports.deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }

  await department.deleteOne();

  res.json({
    success: true,
    message: 'Department deleted successfully'
  });
});