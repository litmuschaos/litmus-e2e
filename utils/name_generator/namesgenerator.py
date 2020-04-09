import random

left = ['litmus-admiring',  'litmus-adoring',  'litmus-affectionate',  'litmus-agitated',  'litmus-amazing',  'litmus-angry',  'litmus-awesome',  'litmus-blissful',  'litmus-boring',  'litmus-brave',  'litmus-clever',  'litmus-cocky',  'litmus-compassionate',  'litmus-competent',  'litmus-condescending',  'litmus-confident',  'litmus-cranky',  'litmus-dazzling',  'litmus-determined',  'litmus-distracted',  'litmus-dreamy',  'litmus-eager',  'litmus-ecstatic',  'litmus-elastic',  'litmus-elated',  'litmus-elegant',  'litmus-eloquent',  'litmus-epic',  'litmus-fervent',  'litmus-festive',  'litmus-flamboyant',  'litmus-focused',  'litmus-friendly',  'litmus-frosty',  'litmus-gallant',  'litmus-gifted',  'litmus-goofy',  'litmus-gracious',  'litmus-happy',  'litmus-high', 'litmus-heuristic',  'litmus-hopeful',  'litmus-hungry',  'litmus-infallible',  'litmus-inspiring',  'litmus-jolly',  'litmus-jovial',  'litmus-keen',  'litmus-kind',  'litmus-laughing',  'litmus-loving',  'litmus-lucid',  'litmus-mad',  'litmus-mystifying',  'litmus-modest',  'litmus-musing',  'litmus-naughty',  'litmus-nervous',  'litmus-nifty',  'litmus-nostalgic',  'litmus-objective',  'litmus-optimistic',  'litmus-peaceful',  'litmus-pedantic',  'litmus-pensive',  'litmus-practical',  'litmus-priceless',  'litmus-quirky',  'litmus-quizzical',  'litmus-relaxed',  'litmus-reverent',  'litmus-romantic',  'litmus-sad',  'litmus-serene',  'litmus-sharp',  'litmus-silly',  'litmus-sleepy',  'litmus-stoic',  'litmus-stupefied',  'litmus-suspicious',  'litmus-tender',  'litmus-thirsty',  'litmus-trusting',  'litmus-unruffled',  'litmus-upbeat',  'litmus-vibrant',  'litmus-vigilant',  'litmus-vigorous',  'litmus-wizardly',  'litmus-wonderful',  'litmus-xenodochial',  'litmus-youthful',  'litmus-zealous',  'litmus-zen',]
right = ['albattani', 'allen', 'almeida', 'agnesi', 'archimedes', 'ardinghelli', 'aryabhata', 'austin', 'babbage', 'banach', 'bardeen', 'bartik', 'bassi', 'beaver', 'bell', 'benz', 'bhabha', 'bhaskara', 'blackwell', 'bohr', 'booth', 'borg', 'bose', 'boyd', 'brahmagupta', 'brattain', 'brown', 'carson', 'chandrasekhar', 'shannon', 'clarke', 'colden', 'cori', 'cray','curran', 'curie', 'darwin', 'davinci', 'dijkstra', 'dubinsky', 'easley', 'edison', 'einstein', 'elion', 'engelbart', 'euclid', 'euler', 'fermat', 'fermi', 'feynman', 'franklin', 'galileo', 'gates', 'goldberg', 'goldstine', 'goldwasser', 'golick', 'goodall', 'haibt', 'hamilton', 'hawking', 'heisenberg', 'hermann', 'heyrovsky', 'hodgkin', 'hoover', 'hopper', 'hugle', 'hypatia', 'jackson', 'jang', 'jennings', 'jepsen', 'johnson', 'joliot', 'jones', 'kalam', 'kare', 'keller', 'kepler', 'khorana', 'kilby', 'kirch', 'knuth', 'kowalevski', 'lalande', 'lamarr', 'lamport', 'leakey', 'leavitt', 'lewin', 'lichterman', 'liskov', 'lovelace', 'lumiere', 'mahavira', 'mayer', 'mccarthy', 'mcclintock', 'mclean', 'mcnulty', 'meitner', 'meninsky', 'mestorf', 'minsky', 'mirzakhani', 'morse', 'murdock', 'neumann', 'newton', 'nightingale', 'nobel', 'noether', 'northcutt', 'noyce', 'panini', 'pare', 'pasteur', 'payne', 'perlman', 'pike', 'poincare', 'poitras', 'ptolemy', 'raman', 'ramanujan', 'ride', 'montalcini', 'ritchie', 'roentgen', 'rosalind', 'saha', 'sammet', 'shaw', 'shirley', 'shockley', 'sinoussi', 'snyder', 'spence', 'stallman', 'stonebraker', 'swanson', 'swartz', 'swirles', 'tesla', 'thompson', 'torvalds', 'turing', 'varahamihira', 'visvesvaraya', 'volhard', 'wescoff', 'wiles', 'williams', 'wilson', 'wing', 'wozniak', 'wright', 'yalow', 'yonath',]
def get_random_name(sep='-'):
    r = random.SystemRandom()
    while 1:
        name = '%s%s%s' % (r.choice(left), sep, r.choice(right))
        if name == 'boring' + sep + 'wozniak':
            continue
        return name

if __name__ == '__main__':
    print(get_random_name())