/* eslint-disable consistent-return */
/* eslint-disable no-console */
// routes for "/"
const Club = require('../models/club');
const User = require('../models/user');

const getAll = () => async (req, res) => {
  try {
    const docs = await Club
      .find({ })
      .lean()
      .exec();

    res.status(200).json({ data: docs });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

const createOne = () => async (req, res) => {
  try {
    const doc = await Club.create({ ...req.body });
    const newDoc = await Club.findOneAndUpdate({ _id: doc._id }, { admin: req.user._id }, { new: true })
      .exec();
    const user = await User.findOneAndUpdate({ _id: req.user._id }, { $push: { 'clubs.owner': newDoc._id } }, { new: true })
      .exec();
    res.status(201).json({ data: newDoc });
  } catch (e) {
    console.error(e);
    res.status(404).end();
  }
};

// routes for  "/:id"
const getOne = () => async (req, res) => {
  try {
    const doc = await Club
      .findOne({ _id: req.params.id })
      .lean()
      .exec();

    if (!doc) {
      return res.status(400).end();
    }

    res.status(200).json({ data: doc });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

const deleteOne = () => async (req, res) => {
  try {
    if (club.team.includes(String(req.user._id))) return res.status(403).json({ message: 'Not allowed' });
    if (club.members.includes(String(req.user._id))) return res.status(403).json({ message: 'Not allowed' });
    const removed = await Club.findOneAndRemove({
      _id: req.params.id,
    });
    if (!removed) {
      return res.status(400).end();
    }

    const user = await User.findOneAndUpdate({ _id: req.user._id }, { $pull: { 'clubs.owner': req.params.id } }, { new: true })
      .exec();

    return res.status(200).json({ data: removed });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

const join = () => async (req, res) => {
  try {
    const club = await Club.findOne({ _id: req.params.id });
    if (!club) {
      return res.status(400).end();
    }

    if (club.admin == String(req.user._id)) return res.status(403).json({ message: 'Already Admin' });
    if (club.team.includes(String(req.user._id))) return res.status(403).json({ message: 'Already in Team' });
    if (club.members.includes(String(req.user._id))) return res.status(403).json({ message: 'Already Member' });

    const newClub = await Club.findOneAndUpdate({ _id: req.params.id }, { $push: { members: req.user._id } }, { new: true }).exec();
    const user = await User.findOneAndUpdate({ _id: req.user._id }, { $push: { 'clubs.member': req.params.id } }, { new: true }).exec();
    return res.status(200).json({ data: newClub });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

const leave = () => async (req, res) => {
  try {
    const club = await Club.findOne({ _id: req.params.id });
    if (!club) {
      return res.status(400).end();
    }

    if (club.admin == String(req.user._id)) return res.status(403).json({ message: 'Not Allowed' });
    if (!club.members.includes(String(req.user._id))) return res.status(403).json({ message: 'Not Allowed' });

    const newClub = await Club.findOneAndUpdate({ _id: req.params.id }, { $pull: { members: req.user._id },$pull: {team: req.user._id} }, { new: true }).exec();
    const user = await User.findOneAndUpdate({ _id: req.user._id }, { $pull: { 'clubs.member': req.params.id } }, { new: true }).exec();
    return res.status(200).json({ data: newClub });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

module.exports = {
  getAll,
  createOne,
  getOne,
  deleteOne,
  join,
  leave,
};