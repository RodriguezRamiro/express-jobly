// express-jobly/routes/jobs.js


"use strict";

const express = require("express");
const Job = require("../models/job");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const router = new express.Router();

// GET /jobs - Get all jobs with optional filters
router.get("/", async (req, res, next) => {
  try {
    const jobs = await Job.filter(req.query);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

// POST /jobs - Create a new job (admin only)
router.post("/", ensureLoggedIn, ensureAdmin, async (req, res, next) => {
  try {
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

// GET /jobs/:id - Get a job by ID
router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

// PATCH /jobs/:id - Update a job (admin only)
router.patch("/:id", ensureLoggedIn, ensureAdmin, async (req, res, next) => {
  try {
    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

// DELETE /jobs/:id - Delete a job (admin only)
router.delete("/:id", ensureLoggedIn, ensureAdmin, async (req, res, next) => {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
