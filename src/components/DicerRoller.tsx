import { useState } from 'preact/hooks';

function randomNumber(min: number, max: number): number {
  return Math.floor(
    Math.random() * (max - min + 1) + min
  )
}

function rollDice(
  numDice: number,
  diceSides: number,
  modifier: number
): number {
  let result = 0;

  for (let i = 0; i < numDice; i++) {
    result += randomNumber(1, diceSides);
  }

  return result + modifier;
}

export default function DiceRoller(): JSX.Element {
  const [numDice, setNumDice] = useState(1);
  const [diceSides, setDiceSides] = useState(20);
  const [modifier, setModifier] = useState(0);
  const [result, setResult] = useState(null);

  return (
    <>
      <div className="DiceRoller__container">
        <input
          type="number"
          value={diceSides}
          onChange={(e: any) => setNumDice(parseInt(e.target.value, 10))}
        />
        D{` `}
        <input
          type="number"
          value={numDice}
          onChange={(e: any) => setDiceSides(parseInt(e.target.value, 10))}
        />
        +{` `}
        <input
          type="number"
          value={modifier}
          onChange={(e: any) => setModifier(parseInt(e.target.value, 10))}
        />
      </div>
      <h4>{result}</h4>
      <button onClick={() => setResult(rollDice(numDice, diceSides, modifier))}>
        Roll!
      </button>
    </>
  );
}
