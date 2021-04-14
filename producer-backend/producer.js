const Kaka = require('node-rdkafka');
const Chance = require('chance');
const serviceBindings = require('kube-service-bindings');

const chance = new Chance();

function initProducer () {

  // set default kafa bindings for connecting to the kafka broker
  let kafkaConnectionBindings =
    { 'metadata.broker.list': process.env.KAFKA_BOOTSTRAP_SERVER ||
                              'my-cluster-kafka-bootstrap:9092' };

  try {
    // check if the deployment has been bound to a kafka instance through
    // service bindings. If so use that connect info
    kafkaConnectionBindings = serviceBindings.getBinding('KAFKA', 'node-rdkafka');
  } catch (err) {};

  const producer = new Kaka.Producer(kafkaConnectionBindings);

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
