import bcrypt from 'bcryptjs';
import { closePool, pool } from '../src/config/db.js';
import { env } from '../src/config/env.js';

const demoPassword = process.env.SEED_DEMO_PASSWORD || 'Pune@2026';
const admin = { name: 'Aditi Kulkarni Platform Admin', email: 'aditi.admin@storerate.demo', address: 'Baner Road, Pune, Maharashtra', role: 'ADMIN' };
const owners = [
  ['Rakesh Seven Eleven Owner', 'rakesh.owner@storerate.demo', 'Baner, Pune, Maharashtra'], ['Priya McDonalds Store Owner', 'priya.owner@storerate.demo', 'Aundh, Pune, Maharashtra'],
  ['Sandeep Shell Petrol Owner', 'sandeep.owner@storerate.demo', 'Wakad, Pune, Maharashtra'], ['Meenal Dmart Store Owner', 'meenal.owner@storerate.demo', 'Bavdhan, Pune, Maharashtra'],
  ['Vikram Starbucks Store Owner', 'vikram.owner@storerate.demo', 'Kothrud, Pune, Maharashtra'], ['Neha Reliance Fresh Owner', 'neha.owner@storerate.demo', 'Kharadi, Pune, Maharashtra'],
  ['Amit Croma Store Owner Pune', 'amit.owner@storerate.demo', 'Viman Nagar, Pune, Maharashtra'], ['Kavita Decathlon Store Owner', 'kavita.owner@storerate.demo', 'Hadapsar, Pune, Maharashtra'],
  ['Rohit Dominoes Store Owner', 'rohit.owner@storerate.demo', 'Hinjawadi, Pune, Maharashtra'], ['Shweta Bookstore Store Owner', 'shweta.owner@storerate.demo', 'Deccan Gymkhana, Pune, Maharashtra']
].map(([name, email, address]) => ({ name, email, address, role: 'STORE_OWNER' }));
const users = [
  ['Ananya Deshmukh Customer User', 'ananya.user@storerate.demo', 'Baner, Pune, Maharashtra'], ['Arjun Patil Customer Account', 'arjun.user@storerate.demo', 'Wakad, Pune, Maharashtra'],
  ['Sneha Joshi Customer Account', 'sneha.user@storerate.demo', 'Aundh, Pune, Maharashtra'], ['Kunal Mehta Customer Account', 'kunal.user@storerate.demo', 'Bavdhan, Pune, Maharashtra'],
  ['Ishita Shah Customer Account', 'ishita.user@storerate.demo', 'Kothrud, Pune, Maharashtra'], ['Aditya Kulkarni Customer User', 'aditya.user@storerate.demo', 'Kharadi, Pune, Maharashtra'],
  ['Pooja Nair Customer Account', 'pooja.user@storerate.demo', 'Viman Nagar, Pune, Maharashtra'], ['Siddharth Jain Customer User', 'siddharth.user@storerate.demo', 'Hadapsar, Pune, Maharashtra'],
  ['Riya Chavan Customer Account', 'riya.user@storerate.demo', 'Hinjawadi, Pune, Maharashtra'], ['Manav Gupta Customer Account', 'manav.user@storerate.demo', 'Deccan Gymkhana, Pune, Maharashtra'],
  ['Tanvi Bhosale Customer User', 'tanvi.user@storerate.demo', 'Pashan, Pune, Maharashtra'], ['Nikhil Agrawal Customer User', 'nikhil.user@storerate.demo', 'Shivajinagar, Pune, Maharashtra']
].map(([name, email, address]) => ({ name, email, address, role: 'USER' }));
const stores = [
  ['McDonalds Baner Pune', 'mcdonalds.baner@storerate.demo', 'Baner Road, Pune, Maharashtra', 'priya.owner@storerate.demo'], ['Shell Petrol Station Wakad', 'shell.wakad@storerate.demo', 'Wakad Main Road, Pune, Maharashtra', 'sandeep.owner@storerate.demo'],
  ['DMart Bavdhan Superstore', 'dmart.bavdhan@storerate.demo', 'Bavdhan High Street, Pune, Maharashtra', 'meenal.owner@storerate.demo'], ['Seven Eleven Aundh Market', 'seveneleven.aundh@storerate.demo', 'Aundh ITI Road, Pune, Maharashtra', 'rakesh.owner@storerate.demo'],
  ['Starbucks Kothrud Pune', 'starbucks.kothrud@storerate.demo', 'Paud Road, Kothrud, Pune, Maharashtra', 'vikram.owner@storerate.demo'], ['Reliance Fresh Kharadi', 'reliance.kharadi@storerate.demo', 'EON Free Zone Road, Kharadi, Pune, Maharashtra', 'neha.owner@storerate.demo'],
  ['Croma Viman Nagar Store', 'croma.vimannagar@storerate.demo', 'Phoenix Marketcity Road, Pune, Maharashtra', 'amit.owner@storerate.demo'], ['Decathlon Hadapsar Pune', 'decathlon.hadapsar@storerate.demo', 'Magarpatta Road, Hadapsar, Pune, Maharashtra', 'kavita.owner@storerate.demo'],
  ['Dominoes Hinjawadi Pune', 'dominoes.hinjawadi@storerate.demo', 'Hinjawadi Phase 1, Pune, Maharashtra', 'rohit.owner@storerate.demo'], ['Crossword Deccan Bookstore', 'crossword.deccan@storerate.demo', 'FC Road, Deccan Gymkhana, Pune, Maharashtra', 'shweta.owner@storerate.demo']
].map(([name, email, address, ownerEmail]) => ({ name, email, address, ownerEmail }));
// Uneven coverage intentionally produces natural-looking counts and averages.
const ratings = [[0,[5,4,5,4,5,4,5,4,5,4,5,4]], [1,[4,4,3,5,4,4,3,4,5]], [2,[5,4,4,5,3,4,4,5,4,3,4]], [3,[3,4,3,4,3,2,4]], [4,[5,4,5,4,4,5,3,4,5,4]], [5,[4,5,4,3,4,5]], [6,[2,3,2,3,2]], [7,[5,4,5,4,5,4,5,4]], [8,[2,3,3]], [9,[4,5]]];

async function upsertUser(client, user) {
  const passwordHash = await bcrypt.hash(demoPassword, 12);
  const result = await client.query(`INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, address = EXCLUDED.address, role = EXCLUDED.role, is_active = TRUE, updated_at = NOW() RETURNING id, email`, [user.name, user.email, passwordHash, user.address, user.role]);
  return result.rows[0];
}
async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const accounts = {};
    for (const account of [admin, ...owners, ...users]) accounts[account.email] = await upsertUser(client, account);
    const seededStores = [];
    for (const store of stores) {
      const result = await client.query(`INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) ON CONFLICT (owner_id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, address = EXCLUDED.address, updated_at = NOW() RETURNING id, name`, [store.name, store.email, store.address, accounts[store.ownerEmail].id]);
      seededStores.push(result.rows[0]);
    }
    for (const [storeIndex, values] of ratings) for (const [userIndex, rating] of values.entries()) await client.query(`INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) ON CONFLICT (user_id, store_id) DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()`, [accounts[users[userIndex].email].id, seededStores[storeIndex].id, rating]);
    await client.query('COMMIT');
    console.log(`Seed complete: ${users.length} users, ${owners.length} owners, ${seededStores.length} stores, ${ratings.reduce((total, [, values]) => total + values.length, 0)} ratings.`);
    console.log('Backend URL:', `http://localhost:${env.port}`);
    console.log('All demo application accounts use:', demoPassword);
  } catch (error) {
    await client.query('ROLLBACK'); console.error('Seed failed:', error); process.exitCode = 1;
  } finally { client.release(); await closePool(); }
}
seed();
