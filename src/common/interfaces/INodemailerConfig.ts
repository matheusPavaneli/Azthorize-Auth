export default interface INodemailerConfig {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
}
