
export const createTablesSQL = `
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    xp INT,
    signals_generated INT,
    signals_won INT,
    bsai_earned DECIMAL(18, 2),
    avatarUrl VARCHAR(255),
    wallet_address VARCHAR(255),
    wallet_chain VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    completed_missions JSONB
);

CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    status VARCHAR(50),
    is_custom BOOLEAN,
    parameters JSONB,
    strategy_id VARCHAR(255),
    performance JSONB,
    user_id VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS missions (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    xp INT,
    reward_type VARCHAR(50),
    reward_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS signals (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    asset VARCHAR(255),
    prediction VARCHAR(50),
    trade_mode VARCHAR(50),
    outcome VARCHAR(50),
    reward_bsai DECIMAL(18, 2),
    reward_xp INT,
    gas_paid DECIMAL(18, 8),
    created_at TIMESTAMP WITH TIME ZONE,
    entryRange VARCHAR(255),
    stopLoss VARCHAR(255),
    takeProfit VARCHAR(255),
    confidence INT,
    shadowScore INT
);
`;
