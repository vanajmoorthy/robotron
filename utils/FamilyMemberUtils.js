
function populateMapWithFamilyMembers(graph) {
    let nodes = Object.values(graph.nodes);

    nodes.forEach(node => {
        if (Math.random() < familyMemberProbability) {
            // Here you would decide the type randomly or by some other logic
            let type = getRandomFamilyMemberType();
            let newMember = new FamilyMember(familySpeed, type);

            // Make sure this position is not already taken by another family member or the player
            if (!positionIsTaken([node.x, node.y])) {
                // Place the family member in this cell
                newMember.gridPosition = [node.x, node.y];
                newMember.posX = node.x * cellSize + cellSize / 2;
                newMember.posY = node.y * cellSize + cellSize / 2;

                // Add the new member to the appropriate array based on type
                if (type === familyMemberType.FATHER) {
                    fathers.push(newMember);
                } else if (type === familyMemberType.MOTHER) {
                    mothers.push(newMember);
                } else if (type === familyMemberType.SIBLING) {
                    siblings.push(newMember);
                }
            }
        }
    });
}

function getRandomFamilyMemberType() {
    // Define the weights for each family member type
    const weights = {
        [familyMemberType.MOTHER]: 1,
        [familyMemberType.FATHER]: 1,
        [familyMemberType.SIBLING]: 4
    };

    // Create an array to hold the weighted types
    let weightedTypes = [];

    for (const [type, weight] of Object.entries(weights)) {
        for (let i = 0; i < weight; i++) {
            weightedTypes.push(type);
        }
    }

    // Randomly select from the weighted array
    let randomIndex = Math.floor(Math.random() * weightedTypes.length);
    return weightedTypes[randomIndex];
}

function positionIsTaken(position) {
    // Check if the position is taken by the player or another family member
    if (position[0] === player.gridPosition[0] && position[1] === player.gridPosition[1]) {
        return true;
    }
    for (let member of [...fathers, ...mothers, ...siblings]) {
        if (member.gridPosition && position[0] === member.gridPosition[0] && position[1] === member.gridPosition[1]) {
            return true;
        }
    }
    return false;
}
