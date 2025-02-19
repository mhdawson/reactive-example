const Kaka = require('node-rdkafka');
const Chance = require('chance');

const chance = new Chance();

function initProducer () {
  const producer = new Kaka.Producer({
    // Alias for metadata.broker.list
    'bootstrap.servers': process.env.KAFKA_BOOTSTRAP_SERVER || 'my-cluster-kafka-bootstrap:9092'
  });

  return new Promise((resolve, reject) => {
    producer
      .on('ready', () => resolve(producer))
      .on('event.error', (err) => {
        console.error('event.error', err);
        reject(err);
      });
    producer.connect();
  });
}

async function createMessage (producer) {
  const value = Buffer.from(chance.country({ full: true }));
  producer.produce('countries', null, value);
}

async function run () {
  const producer = await initProducer();
  setInterval(createMessage, 1000, producer);
}

run();
