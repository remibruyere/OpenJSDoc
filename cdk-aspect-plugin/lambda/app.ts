exports.handler = async () => {
  console.log('Hello from Another Lambda!');
  return {
    statusCode: 200,
    body: JSON.stringify('Hello from Another Lambda!'),
  };
};
