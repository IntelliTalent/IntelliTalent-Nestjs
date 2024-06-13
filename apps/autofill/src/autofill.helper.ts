export class AutofillHelper {
    static getCosine(vec1: { [s: string]: number; }, vec2: { [s: string]: number; }) {
        const vec2Keys = Object.keys(vec2);
        const vec1Keys = Object.keys(vec1);
        const intersection = vec2Keys.filter(key => vec1Keys.includes(key));

        // Calculate the numerator (dot product)
        const numerator = intersection.reduce((sum, key) => sum + vec1[key] * vec2[key], 0);

        // Calculate the denominator (magnitude product)
        const sum1 = Object.values(vec1).reduce((sum, value) => sum + value * value, 0);
        const sum2 = Object.values(vec2).reduce((sum, value) => sum + value * value, 0);
        const denominator = Math.sqrt(sum1) * Math.sqrt(sum2);

        // Handle division by zero
        return denominator === 0 ? 0.0 : numerator / denominator;
    }
    // Function to convert text to a word vector
    static textToVector(text: string) {
        // Find all words using the regular expression
        const words = text.split('_');
        const wordCount = {};
        for (const word of words) {
            // Increment the word count
            wordCount[word] = (wordCount[word] || 0) + 1;
        }
        return wordCount;
    }

    // Function to get the field that is most similar to the user data
    static getMostSimilar(userFields: Map<string,string>, fields: string[], getValue: (field: string) => string, key: boolean = false) {
        const userFieldsKeys = Array.from(userFields.keys());
        const result: { [s: string]: string } = {};

        for (const field of fields) {
            const fieldVector = AutofillHelper.textToVector(field);
            let maxSimilarity = 0.45;
            let mostSimilarField = '';
            for (const key of userFieldsKeys) {
                const userFieldVector = AutofillHelper.textToVector(key);
                const similarity = AutofillHelper.getCosine(fieldVector, userFieldVector);
                if (similarity > maxSimilarity) {
                    maxSimilarity = similarity;
                    mostSimilarField = key;
                }
            }

            result[field] = getValue(mostSimilarField) || (key? field : '');
        }
        return result;
    }


}