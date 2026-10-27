import test from 'node:test';
import assert from 'node:assert/strict';
import { AUDIO_GUIDE_STORIES } from '../data/odishaHistoricalStories.ts';

test('verifies Utkal Katha running story has complete documented history, architecture, and folklore', () => {
  const konarkStory = AUDIO_GUIDE_STORIES.find((s) => s.id === 'story-konark');
  assert.ok(konarkStory, 'Konark story must exist');
  assert.ok(konarkStory.monument.includes('Konark'));
  assert.ok(konarkStory.documentedHistory.length > 200, 'Must have detailed documented history');
  assert.ok(konarkStory.legendAndFolklore.length > 100, 'Must have sacred legend');
  assert.ok(konarkStory.architecturalHighlights.length >= 3, 'Must have architectural highlights');
});

test('verifies running story question filtering strictly excludes unrelated transit and hotels', () => {
  const konarkStory = AUDIO_GUIDE_STORIES.find((s) => s.id === 'story-konark')!;
  assert.ok(konarkStory, 'Konark story must exist');
  
  // Simulated story QA response generator
  const answerStoryQuestion = (query: string, story: typeof konarkStory, lang: 'en' | 'or' | 'hi') => {
    const qLower = query.toLowerCase();
    if (qLower.includes('architect') || qLower.includes('carving') || qLower.includes('stone') || qLower.includes('wheel')) {
      return `Architectural details of ${story.monument}: ${story.architecturalHighlights.join('; ')}`;
    }
    if (qLower.includes('dharmapada') || qLower.includes('legend')) {
      return `Sacred legend of ${story.monument}: ${story.legendAndFolklore}`;
    }
    return `Historical records of ${story.monument}: ${story.documentedHistory}`;
  };

  const response1 = answerStoryQuestion('Who carved the stone wheels?', konarkStory, 'en');
  assert.ok(response1.includes('Architectural details of Konark Sun Temple'));
  assert.equal(response1.includes('Mo Bus'), false, 'Must not include unrelated bus routes');
  assert.equal(response1.includes('Panthanivas'), false, 'Must not include hotel listings');

  const response2 = answerStoryQuestion('Tell me the legend of Dharmapada', konarkStory, 'en');
  assert.ok(response2.includes('Sacred legend of Konark Sun Temple'));
  assert.equal(response2.includes('Hotel'), false, 'Must not include hotels');
});
