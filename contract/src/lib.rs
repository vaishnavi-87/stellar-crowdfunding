#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    symbol_short, Address, Env, String, Vec,
};

#[contracttype]
pub enum DataKey {
    Campaign,
    Donations,
    Owner,
}

#[contracttype]
#[derive(Clone)]
pub struct Campaign {
    pub title: String,
    pub goal: i128,
    pub raised: i128,
    pub owner: Address,
    pub active: bool,
}

#[contracttype]
#[derive(Clone)]
pub struct Donation {
    pub donor: Address,
    pub amount: i128,
}

#[contract]
pub struct CrowdfundingContract;

#[contractimpl]
impl CrowdfundingContract {

    pub fn initialize(
        env: Env,
        owner: Address,
        title: String,
        goal: i128,
    ) -> u32 {
        if env.storage().instance().has(&DataKey::Campaign) {
            return 1; // Error: already initialized
        }
        if goal <= 0 {
            return 2; // Error: invalid goal
        }

        owner.require_auth();

        let campaign = Campaign {
            title,
            goal,
            raised: 0,
            owner: owner.clone(),
            active: true,
        };

        env.storage().instance().set(&DataKey::Campaign, &campaign);
        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage().instance().set(&DataKey::Donations, &Vec::<Donation>::new(&env));

        env.events().publish((symbol_short!("init"),), (owner,));

        0 // Success
    }

    pub fn donate(env: Env, donor: Address, amount: i128) -> i128 {
        donor.require_auth();

        let campaign: Option<Campaign> = env.storage().instance().get(&DataKey::Campaign);

        if campaign.is_none() {
            return -1; // Error: campaign not found
        }

        let mut campaign = campaign.unwrap();

        if !campaign.active {
            return -2; // Error: campaign not active
        }

        if amount <= 0 {
            return -3; // Error: invalid amount
        }

        campaign.raised += amount;

        if campaign.raised >= campaign.goal {
            campaign.active = false;
        }

        env.storage().instance().set(&DataKey::Campaign, &campaign);

        let mut donations: Vec<Donation> = env
            .storage()
            .instance()
            .get(&DataKey::Donations)
            .unwrap_or_else(|| Vec::new(&env));

        donations.push_back(Donation {
            donor: donor.clone(),
            amount,
        });

        env.storage().instance().set(&DataKey::Donations, &donations);

        env.events().publish(
            (symbol_short!("donated"),),
            (donor, amount, campaign.raised),
        );

        campaign.raised // Return total raised
    }

    pub fn get_campaign(env: Env) -> Option<Campaign> {
        env.storage().instance().get(&DataKey::Campaign)
    }

    pub fn get_raised(env: Env) -> i128 {
        let campaign: Option<Campaign> = env.storage().instance().get(&DataKey::Campaign);
        campaign.map(|c| c.raised).unwrap_or(0)
    }

    pub fn get_donations(env: Env) -> Vec<Donation> {
        env.storage()
            .instance()
            .get(&DataKey::Donations)
            .unwrap_or_else(|| Vec::new(&env))
    }

    pub fn close_campaign(env: Env, caller: Address) -> u32 {
        caller.require_auth();

        let owner: Option<Address> = env.storage().instance().get(&DataKey::Owner);

        if owner.is_none() {
            return 1; // Error: not initialized
        }

        if caller != owner.unwrap() {
            return 2; // Error: not owner
        }

        let campaign: Option<Campaign> = env.storage().instance().get(&DataKey::Campaign);

        if campaign.is_none() {
            return 3; // Error: campaign not found
        }

        let mut campaign = campaign.unwrap();
        campaign.active = false;
        env.storage().instance().set(&DataKey::Campaign, &campaign);

        env.events().publish((symbol_short!("closed"),), (caller,));

        0 // Success
    }
}