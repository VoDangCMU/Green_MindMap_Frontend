export const OCEAN_DATA = {
    O: {
        label: 'Openness (Cởi mở)',
        behaviors: [
            'modibility behavior (hành vi thích nghi/thay đổi)'
        ]
    },
    C: {
        label: 'Conscientiousness (Tận tâm)',
        behaviors: [
            'goal setting behavior (hành vi đặt mục tiêu)'
        ]
    },
    E: {
        label: 'Extraversion (Hướng ngoại)',
        behaviors: [
            'eating behavior (hành vi ăn uống)',
            'social interaction (hành vi tương tác xã hội)'
        ]
    },
    A: {
        label: 'Agreeableness (Dễ gần)',
        behaviors: [
            'purchasing behavior (hành vi mua sắm)'
        ]
    },
    N: {
        label: 'Neuroticism (Bất ổn cảm xúc)',
        behaviors: [
            'affective state (trạng thái cảm xúc)'
        ]
    }
} as const;

export type OceanKey = keyof typeof OCEAN_DATA;
