const path = require('path');
const basicAuth = require('express-basic-auth');
const booksController = require('../controllers/book.controller');
const householdsController = require('../controllers/household.controller');
const usersController = require('../controllers/user.controller');
const wishlistController = require('../controllers/wishlist.controller');
const env  = process.env.NODE_ENV || 'development';

const authorize = basicAuth({
  users: {'admin': env === 'test' ? 'admin_test' : 'admin'}
});

const apiToken = (req, res, next) => {
  const token = req.get('G-TOKEN');
  if (token === 'ROM831ESV') {
    next();
  } else {
    res.status(403).end();
  }
};

const setUpRoutes = (app, name, controller) => {
  app.get(`/${name}`, controller.list);
  app.post(`/${name}`, controller.create);
  app.get(`/${name}/:id`, controller.getById);
};

module.exports = (app, express) => {
  app.get('/ui', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'index.html'));
  });

  app.get('/landing', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'landing.html'));
  });

  app.use(apiToken);

  setUpRoutes(app, 'books', booksController);
  app.get('/books/search', booksController.search);

  setUpRoutes(app, 'households', householdsController);
  app.get('/households/:householdId/users', usersController.getByHouseholdId);

  setUpRoutes(app, 'users', usersController);

  setUpRoutes(app, 'wishlists', wishlistController);
  app.post('/wishlists/:wishlistId/books/:bookId', wishlistController.addBook)

  const authorized = express.Router();
  app.use(authorized);

  authorized.use(authorize);

  authorized.delete('/books/:id', booksController.deleteById);
  authorized.put('/books/:id', booksController.updateById);

};