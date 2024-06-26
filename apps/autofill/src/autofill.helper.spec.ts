import { AutofillHelper } from "./autofill.helper";

describe('Autofill service', () => {
    
    // test textToVector function
    it('should convert text to vector', () => {
        const text = 'Hello_world';
        const result = AutofillHelper.textToVector(text);
        expect(result).toEqual({ Hello: 1, world: 1 });
    });

    // test getCosine function
    it('calculate cosine similarity between two equal objects', () => {
        const vec1 = { Hello: 1, world: 1 };
        const vec2 = { Hello: 1, world: 1 };
        const result = AutofillHelper.getCosine(vec1, vec2);
        expect(result).toBeCloseTo(1);
    });

    it('calculate cosine similarity between two similar objects', () => {
        const vec1 = { Hello: 1, world: 1 };
        const vec2 = { Hello: 0, world: 1 };
        const result = AutofillHelper.getCosine(vec1, vec2);
        expect(result).toBeGreaterThanOrEqual(0.5);
    });

    it('calculate cosine similarity between two different objects', () => {
        const vec1 = { Hello: 1, world: 1 };
        const vec2 = { Hello: 0, world: 0 };
        const result = AutofillHelper.getCosine(vec1, vec2);
        expect(result).toBeLessThan(0.5);
    });

    // test getMostSimilar function
    it('should get the most similar field', () => {
        const userFields = new Map([['name', 'nabil'], ['email', 'mohamed@gmail.com']]);
        const fields = ['user_name'];
        const getValue = (field: string) => userFields.get(field) || '';
        const result = AutofillHelper.getMostSimilar(userFields, fields, getValue);
        expect(result).toEqual({ user_name: 'nabil' });
    });

});
