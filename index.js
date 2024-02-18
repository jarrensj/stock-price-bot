require('dotenv').config(); 
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');

const token = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ticker') {

        // Get the stock price
        const price = await getStockPrice(interaction.options.getString('ticker'));
        await interaction.reply({content: `${interaction.options.getString('ticker')} ${price}`, ephemeral: false});
    }
   
});

const rest = new REST({ version: '10' }).setToken(token);

const commands = [
    {
        name: 'ticker',
        description: 'Get the price of a stock ticker.',
        options: [
            {
                type: 3, // String type
                name: 'ticker',
                description: 'The stock ticker to get price for',
                required: true
            }
        ]
    }
];

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.login(token);

const getStockPrice = async (tickerName) => {
  try {
    const response = await fetch(
      `https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=${tickerName}`,
      {
        headers: {
          "X-API-KEY": process.env.YFI_API_KEY,
        },
      }
    );
    const json = await response.json();
    return json.quoteResponse.result[0].regularMarketPrice;
  } catch {
    return null;
  }
};