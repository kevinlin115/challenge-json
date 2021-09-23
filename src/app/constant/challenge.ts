export class Challenge {
  id = '';
  name = '';
  subChallengeNames = [] as string[];
  constructor(init?: Partial<Challenge>) {
    Object.assign(this, init);
  }
}
