export default {
  up: async (q) => {
    await q.sequelize.query(
      `
      INSERT INTO events (id, name) VALUES
        (UUID(), 'Example Event 1'),
        (UUID(), 'Example Event 2');
      `
    );
    await q.sequelize.query(
      `
      INSERT INTO users (id, phone_number, registration_number, first_name, last_name, last_connected, eventId)
        SELECT UUID(), '+33612345678', 12345678, 'John', 'Doe', NULL, id
        FROM events WHERE name='Example Event 1';
      `
    );
    await q.sequelize.query(
      `
      INSERT INTO users (id, phone_number, registration_number, first_name, last_name, last_connected, eventId)
        SELECT UUID(), '+33600000000', 12345, 'Jean', 'Dupont', NULL, id
        FROM events WHERE name='Example Event 2';
      `
    );
  },
  down: async () => {},
};
